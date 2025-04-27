package com.fragrance.raumania.dto.response.product;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class ProductVariantResponse {

    private UUID id;
    private String name;
    private String size;
    private String scent;
    private Integer stock;
    private Double price;
    private UUID productId;
}
