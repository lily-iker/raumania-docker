package com.fragrance.raumania.dto.request.order;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CreateOrderItemRequest {
    private UUID productVariantId;
    private Integer quantity;
    private Double price;
}
