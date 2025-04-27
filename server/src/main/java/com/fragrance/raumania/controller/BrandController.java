package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.request.brand.CreateBrandRequest;
import com.fragrance.raumania.dto.request.brand.UpdateBrandRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.service.interfaces.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/brand")
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;

    @PostMapping
    public ResponseEntity<?> createBrand(@RequestBody CreateBrandRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brand created successfully", brandService.createBrand(request))
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(@PathVariable UUID id, @RequestBody UpdateBrandRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brand updated successfully", brandService.updateBrand(id, request))
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBrandById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brand retrieved successfully", brandService.getBrandById(id))
        );
    }

    @GetMapping("/name")
    public ResponseEntity<?> getBrandDropdownList() {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brand name list retrieved successfully", brandService.getBrandDropdownList())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable UUID id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brand deleted successfully", brandService.deleteBrand(id))
        );
    }

    @GetMapping
    public ResponseEntity<?> getAllBrands(
            @RequestParam(defaultValue = "1") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brands retrieved successfully", brandService.getAllBrands(pageNumber, pageSize, sortBy, sortDirection))
        );
    }

    @GetMapping("/{brandId}/products")
    public ResponseEntity<?> getProductsByBrand(
            @PathVariable UUID brandId,
            @RequestParam(defaultValue = "1") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Products retrieved successfully", brandService.getProductByBrand(brandId, pageNumber, pageSize, sortBy, sortDirection)
                )
        );
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchBrands(
            @RequestParam(defaultValue = "1") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam String name) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Search results retrieved successfully", brandService.searchBrands(pageNumber, pageSize, sortBy, sortDirection, name))
        );
    }
}