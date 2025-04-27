package com.fragrance.raumania.dto.response.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class ProductImageResponse {
    private UUID id;
    private String image;
}
