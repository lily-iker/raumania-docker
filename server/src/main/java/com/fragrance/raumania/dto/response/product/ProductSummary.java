package com.fragrance.raumania.dto.response.product;


import java.util.UUID;

public record ProductSummary(
        UUID id,
        String name,
        Double minPrice,
        Double maxPrice,
        String thumbnailImage
) {}
