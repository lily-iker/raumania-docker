package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.dto.response.dashboard.*;
import com.fragrance.raumania.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardSummary() {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Dashboard summary retrieved successfully",
                        dashboardService.getDashboardSummary()));
    }

    @GetMapping("/orders/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrderStatusDistribution() {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Order status distribution retrieved successfully",
                        dashboardService.getOrderStatusDistribution()));
    }

    @GetMapping("/orders/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRecentOrders(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Recent orders retrieved successfully",
                        dashboardService.getRecentOrders(limit)));
    }

    @GetMapping("/reviews/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRecentReviews(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Recent reviews retrieved successfully",
                        dashboardService.getRecentReviews(limit)));
    }
}
