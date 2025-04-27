package com.fragrance.raumania.dto.request.cart;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CreateCartItemRequest {
    @NotNull(message = "Product Variant ID is required")
    private UUID productVariantId;

    @NotNull(message = "Quantity is required")
    private Integer quantity;
}