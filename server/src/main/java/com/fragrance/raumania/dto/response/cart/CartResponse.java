package com.fragrance.raumania.dto.response.cart;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CartResponse {
    private UUID id;
    private UUID userId;
    private List<CartItemResponse> cartItems;
    private Integer totalItems;
    private Double totalPrice;
}
