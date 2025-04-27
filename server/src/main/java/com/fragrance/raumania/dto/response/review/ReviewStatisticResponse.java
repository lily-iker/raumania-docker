package com.fragrance.raumania.dto.response.review;

import lombok.*;

@Getter
@Builder
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewStatisticResponse {
    private Double averageRating;
    private Integer totalReviews;
    private Integer fiveStarReviews;
    private Integer fourStarReviews;
    private Integer threeStarReviews;
    private Integer twoStarReviews;
    private Integer oneStarReviews;
}
