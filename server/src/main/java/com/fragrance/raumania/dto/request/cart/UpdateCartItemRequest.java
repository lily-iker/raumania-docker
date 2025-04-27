package com.fragrance.raumania.dto.request.cart;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class UpdateCartItemRequest {

    @NotNull(message = "Cart item ID is required")
    private UUID cartItemId;

    @NotNull(message = "Quantity is required")
    private Integer quantity;
}
