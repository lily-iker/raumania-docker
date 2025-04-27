package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.dto.request.product.CreateProductVariantRequest;
import com.fragrance.raumania.dto.request.product.UpdateProductVariantRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.product.ProductVariantResponse;

import java.util.UUID;

public interface ProductVariantService {
    ProductVariantResponse createProductVariant(CreateProductVariantRequest request);
    ProductVariantResponse updateProductVariant(UUID id, UpdateProductVariantRequest request);
    ProductVariantResponse getProductVariantById(UUID id);
    UUID deleteProductVariant(UUID id);
    PageResponse<?> getAllProductVariantsByProduct(UUID productId, int pageNumber, int pageSize, String sortBy, String sortDirection);
}
