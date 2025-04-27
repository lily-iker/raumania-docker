package com.fragrance.raumania.repository;

import com.fragrance.raumania.model.cart.Cart;
import com.fragrance.raumania.model.cart.CartItem;

import com.fragrance.raumania.model.product.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    Optional<CartItem> findByProductVariantAndCart(ProductVariant variant, Cart cart);
}
