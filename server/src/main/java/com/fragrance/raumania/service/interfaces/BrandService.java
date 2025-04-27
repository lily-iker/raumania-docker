package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.dto.request.brand.CreateBrandRequest;
import com.fragrance.raumania.dto.request.brand.UpdateBrandRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.brand.BrandNameResponse;
import com.fragrance.raumania.dto.response.brand.BrandResponse;

import java.util.List;
import java.util.UUID;

public interface BrandService {
    BrandResponse createBrand(CreateBrandRequest request);
    BrandResponse updateBrand(UUID id, UpdateBrandRequest request);
    BrandResponse getBrandById(UUID id);
    UUID deleteBrand(UUID id);
    List<BrandNameResponse> getBrandDropdownList();

    PageResponse<?> getProductByBrand(UUID productId, int pageNumber, int pageSize, String sortBy, String sortDirection);
    PageResponse<?> getAllBrands(int pageNumber, int pageSize, String sortBy, String sortDirection);
    PageResponse<?> searchBrands(int pageNumber, int pageSize, String sortBy, String sortDirection, String name);

    PageResponse<?> getAllForDataExport();
}
