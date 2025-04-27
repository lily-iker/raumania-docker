package com.fragrance.raumania.mapper;

import com.fragrance.raumania.dto.response.cart.CartItemResponse;
import com.fragrance.raumania.dto.response.cart.CartResponse;
import com.fragrance.raumania.model.cart.Cart;
import com.fragrance.raumania.model.cart.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartResponse toCartResponse(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItemResponse> cartItemResponses;
        if (cart.getCartItems() != null) {
            cartItemResponses = cart.getCartItems().stream()
                    .map(this::toCartItemResponse)
                    .collect(Collectors.toList());
        }
        else {
            cartItemResponses = new ArrayList<>();
        }

        // Calculate total items and total price
        int totalItems = cartItemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        double totalPrice = cartItemResponses.stream()
                .mapToDouble(item -> item.getPrice().doubleValue() * item.getQuantity())
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .cartItems(cartItemResponses)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .build();
    }

    public CartItemResponse toCartItemResponse(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }

        // Get the product variant
        var productVariant = cartItem.getProductVariant();

        // Get the product from the product variant
        var product = productVariant.getProduct();

        // Get the main product image or the first variant image if available
        String imageUrl = null;
        if (product.getThumbnailImage() != null && !product.getThumbnailImage().isEmpty()) {
            imageUrl = product.getThumbnailImage();
        } else if (product.getProductImages() != null && !product.getProductImages().isEmpty()) {
            imageUrl = product.getProductImages().get(0).getImage();
        }

        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(product.getId())
                .productVariantId(productVariant.getId())
                .productName(product.getName())
                .variantName(productVariant.getName())
                .price(productVariant.getPrice())
                .quantity(cartItem.getQuantity())
                .imageUrl(imageUrl)
                .build();
    }
}
