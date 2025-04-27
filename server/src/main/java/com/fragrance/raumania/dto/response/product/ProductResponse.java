package com.fragrance.raumania.dto.response.product;


import com.fragrance.raumania.dto.response.review.ReviewResponse;
import com.fragrance.raumania.dto.response.review.ReviewStatisticProjection;
import com.fragrance.raumania.dto.response.review.ReviewStatisticResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class ProductResponse {
    private UUID id;
    private String name;
    private String description;
    private String productMaterial;
    private String inspiration;
    private String usageInstructions;
    private String thumbnailImage;
    private Double minPrice;
    private Double maxPrice;
    private Boolean isActive;
    private String brandName;
    private List<ProductVariantResponse> productVariants;
    private List<ProductImageResponse> productImages;
    private List<ReviewResponse> fiveLatestReviews;
    private ReviewStatisticResponse reviewStatistic;
    private List<RelatedProductResponse> relatedProducts;
}