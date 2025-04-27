package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.filter.product.ProductFilter;
import com.fragrance.raumania.dto.request.product.CreateProductRequest;
import com.fragrance.raumania.dto.request.product.UpdateProductRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.dto.response.product.RelatedProductResponse;
import com.fragrance.raumania.service.interfaces.ProductIndexService;
import com.fragrance.raumania.service.interfaces.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductIndexService productIndexService;

    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@Valid @RequestPart(value = "product", required = false)  CreateProductRequest request,
                                           @RequestPart("thumbnailImage") MultipartFile thumbnailImageFile,
                                           @RequestPart(value = "images" , required = false) MultipartFile[] imageFiles) throws IOException {
        return ResponseEntity.ok(
                new ApiResponse<>(201,
                        "Product created successfully",
                        productService.createProduct(request, thumbnailImageFile, imageFiles))
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Product retrieved successfully",
                        productService.getProductById(id))
        );
    }

    @GetMapping("/related")
    public ResponseEntity<?> getRandomProducts(
            @RequestParam(name = "limit", defaultValue = "4") int limit) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Random products retrieved successfully",
                        productService.getRelatedProducts(limit)
                )
        );
    }

    @GetMapping("/filters")
    public ResponseEntity<?> getFilterOptions() {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Filter options retrieved successfully",
                        productService.getAllFilterOptions())
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable UUID id,
                                            @RequestPart("request") UpdateProductRequest request,
                                            @RequestPart(value = "thumbnailImageFile", required = false) MultipartFile thumbnailImageFile,
                                            @RequestPart(value = "imageFiles", required = false) MultipartFile[] imageFiles
    ) throws IOException {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Product updated successfully",
                        productService.updateProduct(id, request, thumbnailImageFile, imageFiles))
        );
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteProductImage(@PathVariable UUID productId,
                                                @PathVariable UUID imageId) {
        productService.deleteProductImage(productId, imageId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Product deleted successfully",
                        productService.deleteProduct(id))
        );
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts(@RequestParam(defaultValue = "1") int pageNumber,
                                            @RequestParam(defaultValue = "10") int pageSize,
                                            @RequestParam(defaultValue = "id") String sortBy,
                                            @RequestParam(defaultValue = "asc") String sortDirection) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Products retrieved successfully",
                        productService.getAllProducts(pageNumber, pageSize, sortBy, sortDirection))
        );
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam(defaultValue = "1") int pageNumber,
                                            @RequestParam(defaultValue = "10") int pageSize,
                                            @RequestParam(defaultValue = "id") String sortBy,
                                            @RequestParam(defaultValue = "asc") String sortDirection,
                                            @RequestParam(required = false) String name,
                                            @RequestParam(required = false) Double minPrice,
                                            @RequestParam(required = false) Double maxPrice,
                                            @RequestParam(required = false) String brandName,
                                            @RequestParam(required = false) Boolean isActive,
                                            @RequestParam(required = false) String size,
                                            @RequestParam(required = false) String scent) {
        ProductFilter filter = ProductFilter.builder()
                .name(name)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .brandName(brandName)
                .isActive(isActive)
                .size(size)
                .scent(scent)
                .build();
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Search and filtered products retrieved successfully",
                        productService.searchAndFilterProducts(pageNumber, pageSize, sortBy, sortDirection, filter))
        );
    }

    @GetMapping("/search-name")
    public ResponseEntity<?> elasticsearchProductsName(@RequestParam String name,
                                                                                   @RequestParam(defaultValue = "0") int pageNumber,
                                                                                   @RequestParam(defaultValue = "5") int pageSize) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Search products name retrieved successfully",
                        productIndexService.searchName(name, pageNumber, pageSize))
        );
    }

    @GetMapping("/search-es")
    public ResponseEntity<?> elasticsearchProducts(@RequestParam(defaultValue = "1") int pageNumber,
                                            @RequestParam(defaultValue = "6") int pageSize,
                                            @RequestParam(defaultValue = "id") String sortBy,
                                            @RequestParam(defaultValue = "asc") String sortDirection,
                                            @RequestParam(required = false) String name,
                                            @RequestParam(required = false) Double minPrice,
                                            @RequestParam(required = false) Double maxPrice,
                                            @RequestParam(required = false) String brandName,
                                            @RequestParam(required = false) Boolean isActive,
                                            @RequestParam(required = false) String size,
                                            @RequestParam(required = false) String scent) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Search and filtered products retrieved successfully",
                        productIndexService.elasticsearchProducts(name, minPrice, maxPrice, brandName, isActive, size, scent, pageNumber, pageSize, sortBy, sortDirection))
        );
    }
}
