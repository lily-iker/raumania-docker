package com.fragrance.raumania.repository;

import com.fragrance.raumania.model.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    @Query("SELECT p FROM Product p WHERE p.name = :name")
    Optional<Product> findByName(@Param("name") String name);

    @Query(value = "SELECT * FROM product ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Product> findRandomProducts(@Param("limit") int limit);

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.brand " +
            "JOIN FETCH p.productVariants")
    List<Product> findAllProductsWithBrandAndVariants();

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.productImages " +
            "JOIN FETCH p.productVariants " +
            "WHERE p.id = :id")
    Optional<Product> findByIdWithVariantsAndImages(@Param("id") UUID id);

    Page<Product> findByBrandId(UUID brandId, Pageable pageable);

    @Query("SELECT DISTINCT p.brand.name FROM Product p")
    List<String> findAllDistinctBrandNames();

    long countByCreatedAtAfter(Date date);
}
