package com.fragrance.raumania.dto.response.review;

public interface ReviewStatisticProjection {
    Double getAverageRating();
    Long getTotalReviews();
    Long getFiveStarReviews();
    Long getFourStarReviews();
    Long getThreeStarReviews();
    Long getTwoStarReviews();
    Long getOneStarReviews();
}



