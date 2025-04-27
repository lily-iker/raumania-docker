package com.fragrance.raumania.dto.response.brand;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class BrandNameResponse {
    private UUID id;
    private String name;
}