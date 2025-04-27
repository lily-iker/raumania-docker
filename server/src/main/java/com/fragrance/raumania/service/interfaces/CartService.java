package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.dto.request.cart.CreateCartItemRequest;
import com.fragrance.raumania.dto.request.cart.UpdateCartItemRequest;
import com.fragrance.raumania.dto.response.cart.CartItemResponse;
import com.fragrance.raumania.dto.response.cart.CartResponse;

import java.util.UUID;

public interface CartService {
    CartResponse getMyCart();
    CartItemResponse addToMyCart(CreateCartItemRequest request);
    CartItemResponse updateMyCartItem(UpdateCartItemRequest request);
    UUID removeFromMyCart(UUID cartItemId);

    CartResponse getCartByUserId(UUID userId);
    CartItemResponse addToCart(UUID userid, CreateCartItemRequest request); //todo: debug this
    CartItemResponse updateCartItem(UUID userid, UpdateCartItemRequest request); //todo: debug this
    UUID removeFromCart(UUID userId, UUID cartItemId);
}
