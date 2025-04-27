package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.filter.review.ReviewFilter;
import com.fragrance.raumania.dto.request.review.CreateReviewRequest;
import com.fragrance.raumania.dto.request.review.UpdateReviewRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.service.interfaces.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/my")
    public ResponseEntity<?> addMyReview(@RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(201,
                        "Review added successfully",
                        reviewService.addMyReview(request))
        );
    }

    @PutMapping("/my")
    public ResponseEntity<?> updateMyReview(@RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Review updated successfully",
                        reviewService.updateMyReview(request))
        );
    }

    @DeleteMapping("/my/{reviewId}")
    public ResponseEntity<?> deleteMyReview(@PathVariable UUID reviewId) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Review deleted successfully",
                        reviewService.deleteMyReview(reviewId))
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> addReview(@RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(201,
                        "Review added successfully",
                        reviewService.addReview(request))
        );
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateReview(@RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Review updated successfully",
                        reviewService.updateReview(request))
        );
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReviewById(@PathVariable UUID reviewId) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Review retrieved successfully",
                        reviewService.getReviewById(reviewId))
        );
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable UUID reviewId) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Review deleted successfully",
                        reviewService.deleteReview(reviewId))
        );
    }

//    @GetMapping("/average/{productId}")
//    public ResponseEntity<?> getAverageRating(@PathVariable UUID productId) {
//        return ResponseEntity.ok(
//                new ApiResponse<>(200,
//                        "Average rating retrieved successfully",
//                        reviewService.getAverageRating(productId))
//        );
//    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllReviews(@RequestParam(defaultValue = "1") int pageNumber,
                                                                    @RequestParam(defaultValue = "10") int pageSize,
                                                                    @RequestParam(defaultValue = "id") String sortBy,
                                                                    @RequestParam(defaultValue = "asc") String sortDirection,
                                                                    @RequestParam(required = false) UUID productId,
                                                                    @RequestParam(required = false) UUID productVariantId) {
        ReviewFilter filter = ReviewFilter.builder()
                .productId(productId)
                .productVariantId(productVariantId)
                .build();

        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "All Review retrieved successfully",
                        reviewService.getAllReviewsByProductIdAndProductVariantId(pageNumber, pageSize, sortBy, sortDirection, filter))
        );
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterReviews(@RequestParam(defaultValue = "1") int pageNumber,
                                                                    @RequestParam(defaultValue = "10") int pageSize,
                                                                    @RequestParam(defaultValue = "id") String sortBy,
                                                                    @RequestParam(defaultValue = "asc") String sortDirection,
                                                                    @RequestParam(required = false) Integer rating,
                                                                    @RequestParam(required = false) UUID productId,
                                                                    @RequestParam(required = false) UUID productVariantId) {

        ReviewFilter filter = ReviewFilter.builder()
                .rating(rating)
                .productId(productId)
                .productVariantId(productVariantId)
                .build();

        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "All Review retrieved successfully",
                        reviewService.filterReviewsByProductIdAndProductVariantId(pageNumber, pageSize, sortBy, sortDirection , filter))
        );
    }
}
