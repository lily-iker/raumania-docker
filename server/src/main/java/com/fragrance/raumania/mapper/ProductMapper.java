package com.fragrance.raumania.mapper;

import com.fragrance.raumania.dto.response.product.ProductResponse;
import com.fragrance.raumania.dto.response.product.SearchProductResponse;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductDocument;
import com.fragrance.raumania.model.product.ProductVariant;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Component
public class ProductMapper {

    public ProductResponse toProductResponse(Product product) {
        if (product == null) {
            return null;
        }
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .inspiration(product.getInspiration())
                .productMaterial(product.getProductMaterial())
                .minPrice(product.getMinPrice())
                .maxPrice(product.getMaxPrice())
                .usageInstructions(product.getUsageInstructions())
                .thumbnailImage(product.getThumbnailImage())
                .isActive(product.getIsActive())
                .brandName(product.getBrand().getName())
                .build();
    }

    public SearchProductResponse toSearchProductResponse(Product product) {
        if (product == null) {
            return null;
        }
        return SearchProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .thumbnailImage(product.getThumbnailImage())
                .price(product.getMinPrice())
                .build();
    }

    public ProductDocument toDocument(Product product) {
        List<ProductVariant> variants = product.getProductVariants() != null
                ? new ArrayList<>(product.getProductVariants())
                : new ArrayList<>();

        Double minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .filter(Objects::nonNull)
                .min(Double::compareTo)
                .orElse(null);

        Double maxPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(null);

        return ProductDocument.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .productMaterial(product.getProductMaterial())
                .inspiration(product.getInspiration())
                .usageInstructions(product.getUsageInstructions())
                .thumbnailImage(product.getThumbnailImage())
                .isActive(product.getIsActive())
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .variantNames(variants.stream().map(ProductVariant::getName).toList())
                .variantSizes(variants.stream().map(ProductVariant::getSize).toList())
                .variantScents(variants.stream().map(ProductVariant::getScent).toList())
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .build();
    }

}