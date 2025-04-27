package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.dto.filter.review.ReviewFilter;
import com.fragrance.raumania.dto.request.review.CreateReviewRequest;
import com.fragrance.raumania.dto.request.review.UpdateReviewRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.review.ReviewResponse;

import java.util.UUID;

public interface ReviewService {
    ReviewResponse addMyReview(CreateReviewRequest request);
    ReviewResponse updateMyReview(UpdateReviewRequest request);
    UUID deleteMyReview(UUID reviewId);
    ReviewResponse addReview(CreateReviewRequest request);
    ReviewResponse updateReview(UpdateReviewRequest request);
    ReviewResponse getReviewById(UUID reviewId);
    UUID deleteReview(UUID reviewId);
//    Double getAverageRating(UUID productId);

    PageResponse<?> getAllReviewsByProductIdAndProductVariantId(int pageNumber, int pageSize, String sortBy, String sortDirection, ReviewFilter filter);
    PageResponse<?> filterReviewsByProductIdAndProductVariantId(int pageNumber, int pageSize, String sortBy, String sortDirection, ReviewFilter filter);
}
