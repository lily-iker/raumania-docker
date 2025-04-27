package com.fragrance.raumania.repository.specification;

import com.fragrance.raumania.dto.filter.product.ProductFilter;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductVariant;
import com.fragrance.raumania.model.product.Brand;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterBy(ProductFilter filter) {
        return (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by name (case-insensitive)
            if (filter.getName() != null && !filter.getName().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + filter.getName().toLowerCase() + "%"));
            }

            // Filter by minPrice
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("maxPrice"), filter.getMinPrice()));
            }

            // Filter by maxPrice
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("minPrice"), filter.getMaxPrice()));
            }

            // Filter by brand name
            if (filter.getBrandName() != null && !filter.getBrandName().isEmpty()) {
                Join<Product, Brand> brandJoin = root.join("brand", JoinType.LEFT);
                predicates.add(cb.equal(cb.lower(brandJoin.get("name")), filter.getBrandName().toLowerCase()));
            }

            // Filter by active status
            if (filter.getIsActive() != null) {
                predicates.add(cb.equal(root.get("isActive"), filter.getIsActive()));
            }

            // Filter by product variant size & scent
            if (filter.getSize() != null || filter.getScent() != null) {
                Join<Product, ProductVariant> variantJoin = root.join("productVariants", JoinType.LEFT);

                if (filter.getSize() != null) {
                    predicates.add(cb.equal(cb.lower(variantJoin.get("size")), filter.getSize().toLowerCase()));
                }

                if (filter.getScent() != null) {
                    predicates.add(cb.equal(cb.lower(variantJoin.get("scent")), filter.getScent().toLowerCase()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}