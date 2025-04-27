package com.fragrance.raumania.dto.filter.product;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductFilter {
    private String name;
    private Double minPrice;
    private Double maxPrice;
    private Boolean isActive;

    // Brand-specific filter
    private String brandName;

    // Product Variant-specific filters
    private String size;
    private String scent;
}

