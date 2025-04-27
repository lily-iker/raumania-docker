package com.fragrance.raumania.mapper;

import com.fragrance.raumania.dto.response.brand.BrandNameResponse;
import com.fragrance.raumania.dto.response.brand.BrandResponse;
import com.fragrance.raumania.model.product.Brand;
import org.springframework.stereotype.Component;

@Component
public class BrandMapper {

    public BrandResponse toBrandResponse(Brand brand) {
        if (brand == null) {
            return null;
        }

        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .build();
    }

    public BrandNameResponse toDropdownResponse(Brand brand) {
        if (brand == null) {
            return null;
        }

        return BrandNameResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .build();
    }
}