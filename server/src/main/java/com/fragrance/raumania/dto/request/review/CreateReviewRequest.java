package com.fragrance.raumania.dto.request.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class CreateReviewRequest {

    @NotNull
    private UUID productId;

    @NotNull
    private UUID productVariantId;

    private UUID userId;

    @Min(1)
    @Max(5)
    private Integer rating;

    @NotBlank
    private String content;
}