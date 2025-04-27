package com.fragrance.raumania.dto.filter.review;


import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewFilter {
    private String content;
    private Integer rating;
    private String username;
    private UUID productId;
    private UUID productVariantId;
}
