package com.fragrance.raumania.mapper;

import com.fragrance.raumania.dto.response.order.OrderSummaryResponse;
import com.fragrance.raumania.dto.response.order.OrderResponse;
import com.fragrance.raumania.model.order.Order;
import com.fragrance.raumania.model.order.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderMapper {
    private final OrderItemMapper orderItemMapper;

    public OrderResponse mapToOrderResponse(Order order) {

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getFullName())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPayment().getPaymentMethod())
                .deliveryMethod(order.getDeliveryMethod())
                .deliveryStatus(order.getDeliveryStatus())
                .deliveryFee(order.getDeliveryFee())
                .houseNumber(order.getHouseNumber())
                .streetName(order.getStreetName())
                .city(order.getCity())
                .state(order.getState())
                .country(order.getCountry())
                .postalCode(order.getPostalCode())
                .createdAt(order.getCreatedAt())
                .orderItems(order.getOrderItems().stream()
                        .map(orderItemMapper::toOrderItemResponse)
                        .toList())
                .build();
    }

    public OrderSummaryResponse mapToOrderSummary(Order order) {
        OrderItem item = order.getOrderItems().isEmpty() ? null : order.getOrderItems().get(0);

        return OrderSummaryResponse.builder()
                .orderId(order.getId())
                .productVariantName(item != null ? item.getProductVariantName() : null)
                .productVariantSize(item != null ? item.getProductVariantSize() : null)
                .productVariantScent(item != null ? item.getProductVariantScent() : null)
                .quantity(item != null ? item.getQuantity() : 0)
                .deliveryStatus(order.getDeliveryStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .build();
    }

}
