package com.fragrance.raumania.mapper;

import com.fragrance.raumania.dto.response.product.ProductVariantResponse;
import com.fragrance.raumania.dto.response.product.SearchProductResponse;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductVariant;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantMapper {

    public ProductVariantResponse toProductVariantResponse(ProductVariant productVariant) {
        return ProductVariantResponse.builder()
                .id(productVariant.getId())
                .name(productVariant.getName())
                .size(productVariant.getSize())
                .scent(productVariant.getScent())
                .stock(productVariant.getStock())
                .price(productVariant.getPrice())
                .productId(productVariant.getProduct().getId())
                .build();
    }


}