package com.fragrance.raumania.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
public class RecentReviewResponse {
    private UUID id;
    private String productName;
    private String customerName;
    private Integer rating;
    private String content;
    private Date date;
}