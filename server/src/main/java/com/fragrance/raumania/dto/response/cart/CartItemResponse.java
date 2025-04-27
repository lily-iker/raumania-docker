package com.fragrance.raumania.dto.response.cart;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CartItemResponse {
    private UUID id;
    private UUID productId;
    private UUID productVariantId;
    private String productName;
    private String variantName;
    private Double price;
    private Integer quantity;
    private String imageUrl;
}
