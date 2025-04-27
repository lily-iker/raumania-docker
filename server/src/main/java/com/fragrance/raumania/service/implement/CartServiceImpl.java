package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.dto.request.cart.CreateCartItemRequest;
import com.fragrance.raumania.dto.request.cart.UpdateCartItemRequest;
import com.fragrance.raumania.dto.response.cart.CartItemResponse;
import com.fragrance.raumania.dto.response.cart.CartResponse;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.mapper.CartMapper;
import com.fragrance.raumania.model.cart.Cart;
import com.fragrance.raumania.model.cart.CartItem;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductVariant;
import com.fragrance.raumania.model.user.User;
import com.fragrance.raumania.repository.*;
import com.fragrance.raumania.service.interfaces.AuthenticationService;
import com.fragrance.raumania.service.interfaces.CartService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartMapper cartMapper;
    private final CartItemRepository cartItemRepository;
    private  final AuthenticationService authenticationService;

    @Override
    @Transactional
    public CartResponse getMyCart() {
        User user = authenticationService.getAuthenticatedUser();

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        return cartMapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartItemResponse addToMyCart(CreateCartItemRequest request) {
        User user = authenticationService.getAuthenticatedUser();

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        ProductVariant productVariant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product Variant not found"));

        // Check if product is already in cart or else cartItem is null
        CartItem cartItem = null;
        if (cart.getCartItems() != null) {
             cartItem = cart.getCartItems().stream()
                    .filter(item -> item.getProductVariant().getId().equals(productVariant.getId()))
                    .findFirst()
                    .orElse(null);
        }

        int existingQuantity = (cartItem != null) ? cartItem.getQuantity() : 0;
        int totalRequestedQuantity = existingQuantity + request.getQuantity();

        // Check stock
        if (totalRequestedQuantity > productVariant.getStock()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock ("
                    + productVariant.getStock() + ")");
        }

        if (cartItem != null) {
            // If the product is already in the cart, update the quantity
            cartItem.setQuantity(totalRequestedQuantity);
        }

        if (cartItem == null) {
            // If the product is not in the cart, create a new CartItem
            cartItem = CartItem.builder()
                    .price(productVariant.getPrice())
                    .quantity(request.getQuantity())
                    .productVariant(productVariant)
                    .cart(cart)
                    .build();
        }

        cart.getCartItems().add(cartItem);
        cartItem.setCart(cart);

        cartItemRepository.save(cartItem);

        return cartMapper.toCartItemResponse(cartItem);
    }

    @Override
    @Transactional
    public CartItemResponse updateMyCartItem(UpdateCartItemRequest request) {
        CartItem cartItem = cartItemRepository.findById(request.getCartItemId())
                .orElseThrow(() -> new ResourceNotFoundException("CartItem not found"));
        cartItem.setQuantity(request.getQuantity());
        return cartMapper.toCartItemResponse(cartItem);
    }

    @Override
    @Transactional
    public UUID removeFromMyCart(UUID cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem not found"));
        cartItemRepository.delete(cartItem);
        return cartItemId;
    }

    @Override
    public CartResponse getCartByUserId(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart or userId not found"));

        return cartMapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartItemResponse addToCart(UUID userId, CreateCartItemRequest request) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        ProductVariant productVariant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product Variant not found"));

         // Check if product is already in cart or else cartItem is null
       CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(productVariant.getId()))
                .findFirst()
                .orElse(null);


        int existingQuantity = (cartItem != null) ? cartItem.getQuantity() : 0;
        int totalRequestedQuantity = existingQuantity + request.getQuantity();

        // Check stock
        if (totalRequestedQuantity > productVariant.getStock()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock ("
                    + productVariant.getStock() + ")");
        }

       if (cartItem != null) {
            // If the product is already in the cart, update the quantity
            cartItem.setQuantity(totalRequestedQuantity);
       }

        if (cartItem == null) {
            // If the product is not in the cart, create a new CartItem
            cartItem = CartItem.builder()
                    .price(productVariant.getPrice())
                    .quantity(request.getQuantity())
                    .productVariant(productVariant)
                    .cart(cart)
                    .build();
        }

        cart.getCartItems().add(cartItem);
        cartItem.setCart(cart);

        cartItemRepository.save(cartItem);

        return cartMapper.toCartItemResponse(cartItem);
    }

    @Override
    @Transactional
    public CartItemResponse updateCartItem(UUID userId, UpdateCartItemRequest request) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem cartItem = cartItemRepository.findById(request.getCartItemId())
                .orElseThrow(() -> new ResourceNotFoundException("CartItem not found"));

        cartItem.setQuantity(request.getQuantity());

        cartRepository.save(cart);
        cartItemRepository.save(cartItem);

        return cartMapper.toCartItemResponse(cartItem);
    }

    @Override
    public  UUID removeFromCart(UUID userId, UUID cartItemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem not found"));

        cart.getCartItems().remove(cartItem);
        cartRepository.save(cart);
        cartItemRepository.deleteById(cartItemId);

        return cartItemId;
    }
}
