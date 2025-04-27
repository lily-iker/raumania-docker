package com.fragrance.raumania.controller;

import com.fragrance.raumania.constant.payment.PaymentStatus;
import com.fragrance.raumania.dto.request.payment.CreatePaymentRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.model.cart.Cart;
import com.fragrance.raumania.model.cart.CartItem;
import com.fragrance.raumania.model.order.Order;
import com.fragrance.raumania.model.order.OrderItem;
import com.fragrance.raumania.model.product.ProductVariant;
import com.fragrance.raumania.model.user.User;
import com.fragrance.raumania.repository.*;
import com.fragrance.raumania.service.StripeService;
import com.fragrance.raumania.service.interfaces.OrderService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
public class StripeController {

    private final StripeService stripeService;
    @Value("${stripe.secretKey}")
    private String stripeSecretKey;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody CreatePaymentRequest createPaymentRequest) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                    "Payment Created successfully",
                        stripeService.createPaymentFromOrder(createPaymentRequest)));

    }

    @GetMapping("/success")
    public ResponseEntity<String> verifyPayment(@RequestParam String session_id) {
        try {
            Stripe.apiKey = stripeSecretKey;
            Session session = Session.retrieve(session_id);

            if ("paid".equals(session.getPaymentStatus())) {
                String orderIdString = session.getMetadata().get("order_id");
                System.out.println("Order ID from session metadata: " + orderIdString);
                if (orderIdString != null) {
                    UUID orderId = UUID.fromString(orderIdString);

                    stripeService.updateOrderPaymentStatus(orderId, PaymentStatus.COMPLETED);
                    stripeService.updatePaymentEntityStatus(orderId, PaymentStatus.COMPLETED);

                    return ResponseEntity.ok("Payment successful, order updated.");
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Order ID not found in session metadata.");
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Payment not completed.");
            }
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error verifying payment.");
        }
    }
}
