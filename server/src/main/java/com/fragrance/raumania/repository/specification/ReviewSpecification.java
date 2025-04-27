package com.fragrance.raumania.repository.specification;

import com.fragrance.raumania.dto.filter.review.ReviewFilter;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductVariant;
import com.fragrance.raumania.model.product.Review;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ReviewSpecification {

    public static Specification<Review> filterBy(ReviewFilter filter) {
        return (Root<Review> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Apply filter for 'content' (partial match using LIKE)
            if (filter.getContent() != null) {
                predicates.add(cb.like(cb.lower(root.get("content")), "%" + filter.getContent().toLowerCase() + "%"));
            }

            // Apply filter for 'rating'
            if (filter.getRating() != null) {
                predicates.add(cb.equal(root.get("rating"), filter.getRating()));
            }

            // Apply filter for 'username'
            if (filter.getUsername() != null) {
                predicates.add(cb.equal(root.get("username"), filter.getUsername()));
            }

            // Apply filter for 'productId' (assuming 'Review' has a relationship to 'Product')
            if (filter.getProductId() != null) {
                Join<Review, Product> productJoin = root.join("product", JoinType.LEFT);
                predicates.add(cb.equal(productJoin.get("id"), filter.getProductId()));
            }

            // Apply filter for 'productVariantId' (assuming 'Review' has a relationship to 'ProductVariant')
            if (filter.getProductVariantId() != null) {
                Join<Review, ProductVariant> productVariantJoin = root.join("productVariant", JoinType.LEFT);
                predicates.add(cb.equal(productVariantJoin.get("id"), filter.getProductVariantId()));
            }

            // Combine all predicates (AND logic)
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
