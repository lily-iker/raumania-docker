package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.request.user.CreateUserRequest;
import com.fragrance.raumania.dto.request.user.UpdatePasswordRequest;
import com.fragrance.raumania.dto.request.user.UpdateUserRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.service.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/my-info")
    public ResponseEntity<?> getMyInfo() {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "User info retrieved successfully",
                        userService.getMyInfo())
        );
    }

    @PutMapping("/update-my-info")
    public ResponseEntity<?> updateMyInfo(
            @Valid @RequestPart("data") UpdateUserRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "User info updated successfully",
                        userService.updateMyInfo(request, imageFile))
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(201,
                        "User created successfully",
                        userService.createUser(request))
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "User retrieved successfully",
                        userService.getUserById(id))
        );
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        try {
            userService.updateMyPassword(request);
            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Password updated successfully", null)
            );
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, ex.getMessage(), null));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, ex.getMessage(), null));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, "An unexpected error occurred", null));
        }
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "User updated successfully",
                        userService.updateUser(id, request))
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "User deleted successfully",
                        userService.deleteUser(id))
        );
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "1") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Users retrieved successfully",
                        userService.getAllUsers(pageNumber, pageSize, sortBy, sortDirection))
        );
    }
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam(defaultValue = "1") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) String name) {

        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Users retrieved successfully",
                        userService.searchUsers(pageNumber, pageSize, sortBy, sortDirection, name))
        );
    }
}
