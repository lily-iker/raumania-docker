package com.fragrance.raumania.dto.response.review;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@Builder
public class ReviewResponse {
    private UUID id;
    private UUID productId;
    private UUID productVariantId;
    private UUID userId;
    private String userName;
    private Integer rating;
    private String content;
    private Date createdAt;
}