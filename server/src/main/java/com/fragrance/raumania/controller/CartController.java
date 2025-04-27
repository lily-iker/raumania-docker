package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.request.cart.CreateCartItemRequest;
import com.fragrance.raumania.dto.request.cart.UpdateCartItemRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.service.interfaces.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/my-cart")
    public ResponseEntity<?> getMyCart() {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Cart retrieved successfully", cartService.getMyCart())
        );
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToMyCart(@RequestBody CreateCartItemRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Item added to cart successfully", cartService.addToMyCart(request))
        );
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateMyCartItem(@RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Cart item updated successfully", cartService.updateMyCartItem(request))
        );
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeFromMyCart(@PathVariable UUID cartItemId) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Item removed from cart successfully", cartService.removeFromMyCart(cartItemId))
        );
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCartByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Cart retrieved successfully", cartService.getCartByUserId(userId))
        );
    }

    @PostMapping("/user/{userId}/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addToCart(@PathVariable UUID userId, @RequestBody CreateCartItemRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Item added to cart successfully", cartService.addToCart(userId, request))
        );
    }

    @PutMapping("/user/{userId}/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCartItem(@PathVariable UUID userId, @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Cart item updated successfully", cartService.updateCartItem(userId, request))
        );
    }

    @DeleteMapping("/user/{userId}/remove/{cartItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeFromCart(@PathVariable UUID userId, @PathVariable UUID cartItemId) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Item removed from cart successfully", cartService.removeFromCart(userId, cartItemId))
        );
    }
}
