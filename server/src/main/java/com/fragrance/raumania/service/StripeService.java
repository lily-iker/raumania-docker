package com.fragrance.raumania.service;

import com.fragrance.raumania.constant.payment.PaymentMethod;
import com.fragrance.raumania.constant.payment.PaymentStatus;
import com.fragrance.raumania.dto.request.payment.CreatePaymentRequest;
import com.fragrance.raumania.dto.response.payment.CreatePaymentResponse;
import com.fragrance.raumania.dto.response.stripe.StripeResponse;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.model.order.Order;
import com.fragrance.raumania.model.order.OrderItem;
import com.fragrance.raumania.model.payment.Payment;
import com.fragrance.raumania.repository.OrderRepository;
import com.fragrance.raumania.repository.PaymentRepository;
import com.fragrance.raumania.service.interfaces.OrderService;
import com.fragrance.raumania.service.interfaces.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StripeService {
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    @Value("${stripe.secretKey}")
    private String secretKey;

    @Value("${stripe.success-url}")
    private String stripeSuccessUrl;

    @Value("${stripe.cancel-url}")
    private String stripeCancelUrl;

    public StripeResponse<?> createPaymentFromOrder(CreatePaymentRequest createPaymentRequest) {
        Stripe.apiKey = secretKey;

        Order order = orderRepository.findById(createPaymentRequest.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED) {
            return StripeResponse.builder()
                    .status(PaymentStatus.COMPLETED.name())
                    .message("Payment has already been completed for this order.")
                    .httpStatus(400)
                    .data(null)
                    .build();
        }

        if (order.getPayment().getPaymentMethod() == PaymentMethod.CASH) {
            return StripeResponse
                    .builder()
                    .status(String.valueOf(PaymentStatus.PENDING))
                    .message("Payment skipped as method is CASH")
                    .httpStatus(200)
                    .data(null)
                    .build();
        }

        List<SessionCreateParams.LineItem> lineItems = buildLineItems(order);

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(stripeSuccessUrl)
                .setCancelUrl(stripeCancelUrl)
                .putMetadata("order_id", order.getId().toString());


        for (SessionCreateParams.LineItem lineItem : lineItems) {
            paramsBuilder.addLineItem(lineItem);
        }

        SessionCreateParams params = paramsBuilder.build();

        Session session;
        try {
            session = Session.create(params);
        } catch (StripeException e) {
            return StripeResponse
                    .builder()
                    .status(String.valueOf(PaymentStatus.FAILED))
                    .message("Payment session creation failed: " + e.getMessage())
                    .httpStatus(400)
                    .data(null)
                    .build();
        }

        CreatePaymentResponse responseData = CreatePaymentResponse
                .builder()
                .sessionId(session.getId())
                .sessionUrl(session.getUrl())
                .build();

        return StripeResponse
                .builder()
                .status(String.valueOf(PaymentStatus.PENDING))
                .message("Payment session created successfully")
                .httpStatus(200)
                .data(responseData)
                .build();
    }

    private List<SessionCreateParams.LineItem> buildLineItems(Order order) {
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        for (OrderItem orderItem : order.getOrderItems()) {
            String productName = orderItem.getProductVariantName();

                StringBuilder variantInfo = new StringBuilder(" (");

                if (orderItem.getProductVariantSize() != null) {
                    variantInfo.append(orderItem.getProductThumbnail()).append("  ");
                }

                if (orderItem.getProductVariantSize() != null) {
                    variantInfo.append("Size: ").append(orderItem.getProductVariantSize()).append(", ");
                }
                if (orderItem.getProductVariantScent() != null) {
                    variantInfo.append("Scent: ").append(orderItem.getProductVariantScent()).append(", ");
                }

                String variantText = variantInfo.toString();
                if (variantText.endsWith(", ")) {
                    variantText = variantText.substring(0, variantText.length() - 2);
                }
                variantText += ")";

                productName += variantText;

            // Create product data
            SessionCreateParams.LineItem.PriceData.ProductData productData =
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName(productName)
                            .build();

            // Convert price to cents for Stripe (Stripe expects amount in smallest currency unit)
            long unitAmount = Math.round(orderItem.getUnitPrice() * 100);

            // Create price data
            SessionCreateParams.LineItem.PriceData priceData =
                    SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("USD") // Set your currency here
                            .setUnitAmount(unitAmount)
                            .setProductData(productData)
                            .build();

            // Create line item
            SessionCreateParams.LineItem lineItem =
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(Long.valueOf(orderItem.getQuantity()))
                            .setPriceData(priceData)
                            .build();

            lineItems.add(lineItem);
        }

        if (order.getDeliveryFee() > 0) {
            // Create product data for shipping
            SessionCreateParams.LineItem.PriceData.ProductData shippingProductData =
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName("Shipping Fee (" + order.getDeliveryMethod().toString() + ")")
                            .build();

            long shippingAmount = Math.round(order.getDeliveryFee() * 100);

            // Create price data for shipping
            SessionCreateParams.LineItem.PriceData shippingPriceData =
                    SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("USD")
                            .setUnitAmount(shippingAmount)
                            .setProductData(shippingProductData)
                            .build();

            // Create line item for shipping
            SessionCreateParams.LineItem shippingLineItem =
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(shippingPriceData)
                            .build();

            lineItems.add(shippingLineItem);
        }

        return lineItems;
    }

    public String verifyPayment(@RequestParam String session_id) {
        try {
            Stripe.apiKey = secretKey;
            Session session = Session.retrieve(session_id);

            if ("paid".equals(session.getPaymentStatus())) {
                String orderIdString = session.getMetadata().get("order_id");
                System.out.println("Order ID from session metadata: " + orderIdString);
                if (orderIdString != null) {
                    UUID orderId = UUID.fromString(orderIdString);

                    updateOrderPaymentStatus(orderId, PaymentStatus.COMPLETED);
                    updatePaymentEntityStatus(orderId, PaymentStatus.COMPLETED);
                }
            }
        } catch (StripeException e) {
            return "Error verifying payment.";
        }
        return "Payment successful, order updated.";
    }

    @Transactional
    public Payment getPaymentByOrderId(UUID orderId) {
        return paymentRepository
                .findByOrder_Id(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for order: " + orderId));
    }

    @Transactional
    public void updateOrderPaymentStatus(UUID orderId, PaymentStatus paymentStatus) {
        orderService.updatePaymentStatus(orderId, paymentStatus);
    }

    @Transactional
    public void updatePaymentEntityStatus(UUID orderId, PaymentStatus paymentStatus) {
        Payment payment = getPaymentByOrderId(orderId);

        payment.setPaymentStatus(paymentStatus);
    }
}