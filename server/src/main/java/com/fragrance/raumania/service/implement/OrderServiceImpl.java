package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.constant.delivery.DeliveryMethod;
import com.fragrance.raumania.constant.delivery.DeliveryStatus;
import com.fragrance.raumania.constant.order.OrderStatus;
import com.fragrance.raumania.constant.payment.PaymentStatus;
import com.fragrance.raumania.constant.role.RoleName;
import com.fragrance.raumania.dto.request.checkout.CheckoutRequest;
import com.fragrance.raumania.dto.response.order.OrderSummaryResponse;
import com.fragrance.raumania.dto.request.order.UpdateOrderStatusRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.order.OrderItemResponse;
import com.fragrance.raumania.dto.response.order.OrderResponse;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.mapper.OrderItemMapper;
import com.fragrance.raumania.mapper.OrderMapper;
import com.fragrance.raumania.model.cart.CartItem;
import com.fragrance.raumania.model.order.Order;
import com.fragrance.raumania.model.order.OrderItem;
import com.fragrance.raumania.model.payment.Payment;
import com.fragrance.raumania.model.product.ProductVariant;
import com.fragrance.raumania.model.user.User;
import com.fragrance.raumania.repository.*;
import com.fragrance.raumania.service.interfaces.AuthenticationService;
import com.fragrance.raumania.service.interfaces.OrderService;
import com.fragrance.raumania.utils.SortUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemMapper orderItemMapper;
    private final OrderMapper orderMapper;
    private final PaymentRepository paymentRepository;
    private final SortUtils sortUtils;
    private final ProductVariantRepository productVariantRepository;
    private final AuthenticationService authenticationService;


    @Override
    @Transactional
    public void updatePaymentStatus(UUID orderId, PaymentStatus paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setPaymentStatus(paymentStatus);
    }

    @Override
    @Transactional
    public OrderResponse createOrderFromSelectedCartItems(CheckoutRequest checkoutRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        List<UUID> cartItemIds = checkoutRequest.getCartItemIds();

        if (cartItemIds == null || cartItemIds.isEmpty()) {
            throw new ResourceNotFoundException("No cart items selected.");
        }

        List<CartItem> cartItems = cartItemRepository.findAllById(cartItemIds);

        if (cartItems.size() != cartItemIds.size()) {
            throw new ResourceNotFoundException("Some cart items were not found.");
        }

        // Ensure all cart items belong to the authenticated user
        boolean hasInvalidOwner = cartItems.stream()
                .anyMatch(cartItem -> !cartItem.getCart().getUser().getId().equals(user.getId()));

        if (hasInvalidOwner) {
            throw new AccessDeniedException("You are not allowed to access some selected cart items.");
        }

        DeliveryMethod method = checkoutRequest.getDeliveryMethod();
        double deliveryFee = calculateDeliveryFee(method);

        Order order = Order.builder()
                .user(user)
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryStatus(DeliveryStatus.PREPARING)
                .deliveryMethod(method)
                .deliveryFee(deliveryFee)
                .houseNumber(checkoutRequest.getHouseNumber())
                .streetName(checkoutRequest.getStreetName())
                .city(checkoutRequest.getCity())
                .state(checkoutRequest.getState())
                .country(checkoutRequest.getCountry())
                .postalCode(checkoutRequest.getPostalCode())
                .build();

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getProductVariant();
            int quantity = cartItem.getQuantity();

            if (variant.getStock() < quantity) {
                throw new IllegalStateException("Insufficient stock for product: " + variant.getName());
            }

            // Deduct stock
            variant.setStock(variant.getStock() - quantity);
            productVariantRepository.save(variant);

            // Create order item
            double totalPrice = variant.getPrice() * quantity;
            OrderItem orderItem = OrderItem.builder()
                    .productName(variant.getProduct().getName())
                    .productVariantScent(variant.getScent())
                    .productVariantSize(variant.getSize())
                    .productVariantName(variant.getName())
                    .productThumbnail(variant.getProduct().getThumbnailImage())
                    .unitPrice(variant.getPrice())
                    .productDescription(variant.getProduct().getDescription())
                    .quantity(quantity)
                    .productId(variant.getProduct().getId())
                    .productVariantId(variant.getId())
                    .totalPrice(totalPrice)
                    .order(order)
                    .build();

            orderItems.add(orderItem);

            // Delete the cart item
            cartItemRepository.delete(cartItem);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(calculateTotal(orderItems) + deliveryFee);

        Order savedOrder = orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        Payment payment = Payment.builder()
                .paymentAmount(order.getTotalAmount())
                .paymentMethod(checkoutRequest.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .order(savedOrder)
                .build();

        paymentRepository.save(payment);

        List<OrderItemResponse> orderItemResponses = orderItems.stream()
                .map(orderItemMapper::toOrderItemResponse)
                .toList();

        return OrderResponse.builder()
                .id(savedOrder.getId())
                .userId(savedOrder.getUser().getId())
                .totalAmount(savedOrder.getTotalAmount())
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .orderItems(orderItemResponses)
                .build();
    }

    private double calculateDeliveryFee(DeliveryMethod method) {
        return switch (method) {
            case VIETTEL_POST -> 25.0;
            case GRAB_EXPRESS -> 35.0;
            case SHOPEE_EXPRESS -> 20.0;
            case RAUMANIA_EXPRESS -> 36.0;
        };
    }

    @Override
    public Map<String, Map<String, Long>> getAllOrdersStatusCounts() {
        Map<String, Map<String, Long>> result = new HashMap<>();

        result.put("orderStatus", convertListToMap(orderRepository.countByOrderStatus(), OrderStatus.class));
        result.put("paymentStatus", convertListToMap(orderRepository.countByPaymentStatus(), PaymentStatus.class));
        result.put("deliveryStatus", convertListToMap(orderRepository.countByDeliveryStatus(), DeliveryStatus.class));

        return result;
    }

    @Override
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        User currentUser = authenticationService.getAuthenticatedUser();

        boolean isAdmin = currentUser.getRole().getName() == RoleName.ADMIN;
        boolean isOwner = order.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not authorized to access this order.");
        }

        return orderMapper.mapToOrderResponse(order);
    }

    @Override
    public PageResponse<?> getOrdersForCurrentUser(int pageNumber, int pageSize, String sortBy, String sortDirection) {
        if (pageNumber < 1) {
            pageNumber = 1; // Adjust to 1-based index
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        User currentUser = authenticationService.getAuthenticatedUser();

        Page<Order> ordersPage = orderRepository.findByUserId(currentUser.getId(), pageable);

        List<OrderSummaryResponse> orderResponses = ordersPage.getContent().stream()
                .map(orderMapper::mapToOrderSummary)
                .toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(ordersPage.getTotalElements())
                .totalPages(ordersPage.getTotalPages())
                .content(orderResponses)
                .build();
    }


    @Override
    @Transactional
    public UUID deleteOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        orderRepository.delete(order);
        return orderId;
    }

    @Override
    public OrderResponse updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Optional: Only update if provided in request
        if (request.getOrderStatus() != null) {
            try {
                order.setOrderStatus(request.getOrderStatus());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid order status: " + request.getOrderStatus());
            }
        }

        if (request.getPaymentStatus() != null) {
            try {
                order.setPaymentStatus(request.getPaymentStatus());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid payment status: " + request.getPaymentStatus());
            }
        }

        if (request.getDeliveryStatus() != null) {
            try {
                order.setDeliveryStatus(request.getDeliveryStatus());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid delivery status: " + request.getDeliveryStatus());
            }
        }

        orderRepository.save(order);
        return orderMapper.mapToOrderResponse(order);
    }


    @Override
    public PageResponse<?> getAllOrders(int pageNumber, int pageSize, String sortBy, String sortDirection) {
        if (pageNumber < 1) {
            pageNumber = 1; // Adjust to 1-based index
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1 , pageSize, sort);

        Page<Order> ordersPage = orderRepository.findAll(pageable);

        var searchProductsResponse = ordersPage.getContent().stream().map(orderMapper::mapToOrderResponse).toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(ordersPage.getTotalElements())
                .totalPages(ordersPage.getTotalPages())
                .content(searchProductsResponse)
                .build();
    }


    private <E extends Enum<E>> Map<String, Long> convertListToMap(List<Object[]> list, Class<E> enumClass) {
        Map<String, Long> map = Arrays.stream(enumClass.getEnumConstants())
                .collect(Collectors.toMap(Enum::name, e -> 0L));

        for (Object[] obj : list) {
            String key = obj[0].toString();
            Long count = (Long) obj[1];
            map.put(key, count);
        }

        return map;
    }

    private Double calculateTotal(List<OrderItem> orderItems) {
        return orderItems.stream()
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                .sum();
    }
}
