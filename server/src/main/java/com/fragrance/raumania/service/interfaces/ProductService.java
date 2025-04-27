package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.dto.filter.product.ProductFilter;
import com.fragrance.raumania.dto.request.product.CreateProductRequest;
import com.fragrance.raumania.dto.request.product.UpdateProductRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.product.ProductResponse;
import com.fragrance.raumania.dto.response.product.RelatedProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request, MultipartFile thumbnailImageFiles, MultipartFile[] imageFiles) throws IOException;
    ProductResponse updateProduct(UUID id, UpdateProductRequest request, MultipartFile thumbnailImageFiles, MultipartFile[] imageFiles) throws IOException;
    ProductResponse getProductById(UUID id);
    UUID deleteProduct(UUID id);
    List<RelatedProductResponse> getRelatedProducts(int limit);

    PageResponse<?> getAllProducts(int pageNumber, int pageSize, String sortBy, String sortDirection);
    PageResponse<?> searchAndFilterProducts(int pageNumber, int pageSize, String sortBy, String sortDirection, ProductFilter filter);
    void deleteProductImage(UUID productId, UUID imageId);
    Map<String, List<String>> getAllFilterOptions();
}
