package com.fragrance.raumania.dto.response.brand;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class BrandResponse {
    private UUID id;
    private String name;
    private String description;
}