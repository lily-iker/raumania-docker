package com.fragrance.raumania.repository;

import com.fragrance.raumania.model.product.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {
    Optional<Brand> findByName(String name);
    Page<Brand> findByNameContainingIgnoreCase(String name, Pageable pageable);
    @Query("SELECT b FROM Brand b JOIN FETCH b.products")
    List<Brand> findAllWithProducts();
}