package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.request.address.AddressRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.dto.response.address.AddressResponse;
import com.fragrance.raumania.service.interfaces.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/address")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createAddress(@RequestBody AddressRequest addressRequest) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Address created successfully", addressService.createAddress(addressRequest)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAddressById(@PathVariable UUID id) {
        AddressResponse response = addressService.getAddressById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Address fetched successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateAddress(@PathVariable UUID id, @RequestBody AddressRequest addressRequest) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Address updated successfully", addressService.updateAddress(id, addressRequest)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteAddress(@PathVariable UUID id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Address deleted successfully", id.toString()));
    }

    @PostMapping("/my")
    public ResponseEntity<?> createMyAddress(@RequestBody AddressRequest addressRequest) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Address Added successfully ", addressService.createMyAddress(addressRequest)));
    }


    @PutMapping("/my/{id}")
    public ResponseEntity<?> updateMyAddress(@PathVariable UUID id, @RequestBody AddressRequest addressRequest) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Address Updated successfully ", addressService.updateMyAddress(id, addressRequest)));
    }


    @GetMapping("/my/{userId}")
    public ResponseEntity<?> getMyAddress(@PathVariable UUID userId) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Address Fetched successfully ", addressService.getMyAddress(userId)));
    }


    @DeleteMapping("/my/{userId}")
    public ResponseEntity<?> deleteMyAddress(@PathVariable UUID userId) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Address for user deleted successfully", addressService.deleteMyAddress(userId))
        );
    }
}
