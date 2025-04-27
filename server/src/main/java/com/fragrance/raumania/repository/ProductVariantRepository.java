package com.fragrance.raumania.repository;

import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.name = :name AND pv.product = :product")
    Optional<ProductVariant> findByNameAndProduct(@Param("name") String name, @Param("product") Product product);

    Optional<ProductVariant> findByName(String name);

    Set<ProductVariant> findByProduct(Product product);

    long countByProductId(UUID productId);

    List<ProductVariant> findByProductId(UUID productId);

    List<ProductVariant> findAllByProductId(UUID productId);

    Page<ProductVariant> findByProductId(UUID productId, Pageable pageable);

    boolean existsByProductIdAndNameAndSizeAndScent(UUID productId, String name, String size, String scent);

    @Query("SELECT DISTINCT pv.size FROM ProductVariant pv")
    List<String> findAllDistinctSizes();

    @Query("SELECT DISTINCT pv.scent FROM ProductVariant pv")
    List<String> findAllDistinctScents();

}
