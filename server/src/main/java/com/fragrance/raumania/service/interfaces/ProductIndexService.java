package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.dto.response.PageResponse;

import java.util.UUID;

public interface ProductIndexService {
    void indexProduct(UUID productId);
    void unIndexProduct(UUID productId);

    PageResponse<?> searchName(String name, int pageNumber, int pageSize);

    PageResponse<?> elasticsearchProducts(String name,
                                                 Double minPrice,
                                                 Double maxPrice,
                                                 String brandName,
                                                 Boolean isActive,
                                                 String size,
                                                 String scent,
                                                 int pageNumber,
                                                 int pageSize,
                                                 String sortBy,
                                                 String sortDirection);

    PageResponse<?> getAllForDataExport();
}
