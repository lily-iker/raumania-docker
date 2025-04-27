package com.fragrance.raumania.mapper;

import com.fragrance.raumania.dto.response.order.OrderItemResponse;
import com.fragrance.raumania.model.order.OrderItem;

import org.springframework.stereotype.Component;

@Component
public class OrderItemMapper {

    public OrderItemResponse toOrderItemResponse(OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }

        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .productName(orderItem.getProductName())
                .productDescription(orderItem.getProductDescription())
                .productThumbnail(orderItem.getProductThumbnail())
                .productId(orderItem.getProductId())
                .productVariantId(orderItem.getProductVariantId())
                .productVariantName(orderItem.getProductVariantName())
                .productVariantSize(orderItem.getProductVariantSize())
                .productVariantScent(orderItem.getProductVariantScent())
                .unitPrice(orderItem.getUnitPrice())
                .quantity(orderItem.getQuantity())
                .totalPrice(orderItem.getTotalPrice())
                .build();
    }
}
