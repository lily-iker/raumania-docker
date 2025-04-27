package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.request.product.CreateProductVariantRequest;
import com.fragrance.raumania.dto.request.product.UpdateProductVariantRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.service.interfaces.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/product-variant")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createProductVariant(@RequestBody CreateProductVariantRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(201,
                        "Product variant created successfully",
                        productVariantService.createProductVariant(request))
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductVariantById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Product variant retrieved successfully",
                        productVariantService.getProductVariantById(id))
        );
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<?> getProductVariantsByProduct(@PathVariable UUID id,
                                                         @RequestParam(defaultValue = "1") int pageNumber,
                                                         @RequestParam(defaultValue = "10") int pageSize,
                                                         @RequestParam(defaultValue = "id") String sortBy,
                                                         @RequestParam(defaultValue = "asc") String sortDirection) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Product variants retrieved successfully",
                        productVariantService.getAllProductVariantsByProduct(id, pageNumber, pageSize, sortBy, sortDirection))
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateProductVariant(@PathVariable UUID id, @RequestBody UpdateProductVariantRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Product variant updated successfully",
                        productVariantService.updateProductVariant(id, request))
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteProductVariant(@PathVariable UUID id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Product variant deleted successfully",
                        productVariantService.deleteProductVariant(id))
        );
    }
}
