package com.fragrance.raumania.mapper;

import com.fragrance.raumania.dto.response.review.ReviewResponse;
import com.fragrance.raumania.dto.response.review.ReviewStatisticProjection;
import com.fragrance.raumania.model.product.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toReviewResponse(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productVariantId(review.getProductVariant().getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getUsername())
                .rating(review.getRating())
                .createdAt(review.getCreatedAt())
                .content(review.getContent())
                .build();
    }

    public ReviewStatisticProjection toReviewStatisticResponse(ReviewStatisticProjection reviewStatistic) {
        if (reviewStatistic == null) {
            return null;
        }
        return reviewStatistic;
    }
}