package com.fragrance.raumania.dto.response.brand;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Builder
@Getter
public class BrandExportResponse {
    private UUID id;
    private String name;
    private List<String> productNames;
}
