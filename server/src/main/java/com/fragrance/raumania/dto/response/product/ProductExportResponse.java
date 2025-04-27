package com.fragrance.raumania.dto.response.product;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class ProductExportResponse {
    private UUID id;
    private String name;
    private Double price;
    private String brandName;
    private List<String> variantName;
}
