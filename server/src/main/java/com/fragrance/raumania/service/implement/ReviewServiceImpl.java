package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.dto.filter.review.ReviewFilter;
import com.fragrance.raumania.dto.request.review.CreateReviewRequest;
import com.fragrance.raumania.dto.request.review.UpdateReviewRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.review.ReviewResponse;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.mapper.ReviewMapper;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductVariant;
import com.fragrance.raumania.model.product.Review;
import com.fragrance.raumania.model.user.User;
import com.fragrance.raumania.repository.ProductRepository;
import com.fragrance.raumania.repository.ProductVariantRepository;
import com.fragrance.raumania.repository.ReviewRepository;
import com.fragrance.raumania.repository.UserRepository;
import com.fragrance.raumania.repository.specification.ReviewSpecification;
import com.fragrance.raumania.service.interfaces.ReviewService;
import com.fragrance.raumania.utils.SortUtils;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;
    private final SortUtils sortUtils;

    @Override
    @Transactional
    public ReviewResponse addMyReview(CreateReviewRequest request) {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        User user = (User) securityContext.getAuthentication().getPrincipal();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductVariant productVariant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product Variant not found"));

        Review review = Review.builder()
                .product(product)
                .productVariant(productVariant)
                .user(user)
                .rating(request.getRating())
                .content(request.getContent())
                .build();

        Review savedReview = reviewRepository.save(review);

        return reviewMapper.toReviewResponse(savedReview);
    }

    @Override
    public ReviewResponse updateMyReview(UpdateReviewRequest request) {
        // Get the current authenticated user
        SecurityContext securityContext = SecurityContextHolder.getContext();
        User currentUser = (User) securityContext.getAuthentication().getPrincipal();

        // Fetch the review using the review ID from the request
        Review review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));

        // Check if the review belongs to the current user
        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Review not found for current user");
        }

        // Update the review fields
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        Review updatedReview = reviewRepository.save(review);

        return reviewMapper.toReviewResponse(updatedReview);
    }

    @Override
    public UUID deleteMyReview(UUID reviewId) {
        // Get the current authenticated user
        SecurityContext securityContext = SecurityContextHolder.getContext();
        User currentUser = (User) securityContext.getAuthentication().getPrincipal();

        // Fetch the review and check ownership
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Review not found for current user");
        }

        reviewRepository.delete(review);
        return reviewId;
    }

    @Override
    @Transactional
    public ReviewResponse addReview(CreateReviewRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductVariant productVariant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product Variant not found"));

        Review review = Review.builder()
                .product(product)
                .productVariant(productVariant)
                .user(user)
                .rating(request.getRating())
                .content(request.getContent())
                .build();

        Review savedReview = reviewRepository.save(review);

        return reviewMapper.toReviewResponse(savedReview);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(UpdateReviewRequest request) {
        Review review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));

        review.setRating(request.getRating());
        review.setContent(request.getContent());

        return reviewMapper.toReviewResponse(review);
    }

    @Override
    public ReviewResponse getReviewById(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));
        return reviewMapper.toReviewResponse(review);
    }

    @Override
    public UUID deleteReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));
        reviewRepository.delete(review);
        return reviewId;

    }


//    @Override
//    public Double getAverageRating(UUID productId) {
//        List<Review> reviews = reviewRepository.findByProductId(productId);
//        if (reviews.isEmpty()) {
//            return 0.0;
//        }
//        return reviews.stream()
//                .mapToDouble(Review::getRating)
//                .average()
//                .orElse(0.0);
//    }

    @Override
    public PageResponse<?> getAllReviewsByProductIdAndProductVariantId(int pageNumber, int pageSize, String sortBy, String sortDirection, ReviewFilter filter) {
        if (pageNumber < 1) {
            pageNumber = 1;
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);
        Specification<Review> specification = ReviewSpecification.filterBy(filter);

        Page<Review> reviewsPage = reviewRepository.findAll(specification, pageable);

        var searchReviewResponses = reviewsPage.getContent().stream().map(reviewMapper::toReviewResponse).toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(reviewsPage.getTotalElements())
                .totalPages(reviewsPage.getTotalPages())
                .content(searchReviewResponses)
                .build();
    }

    @Override
    public PageResponse<?> filterReviewsByProductIdAndProductVariantId(int pageNumber, int pageSize, String sortBy, String sortDirection, ReviewFilter filter) {
        if (pageNumber < 1) {
            pageNumber = 1;
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);
        Specification<Review> specification = ReviewSpecification.filterBy(filter);

        Page<Review> reviewsPage = reviewRepository.findAll(specification, pageable);

        var reviewResponses = reviewsPage.getContent().stream().map(reviewMapper::toReviewResponse).toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(reviewsPage.getTotalElements())
                .totalPages(reviewsPage.getTotalPages())
                .content(reviewResponses)
                .build();
    }
}
