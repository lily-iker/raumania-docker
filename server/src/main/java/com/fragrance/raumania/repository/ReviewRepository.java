package com.fragrance.raumania.repository;

import com.fragrance.raumania.dto.response.review.ReviewStatisticProjection;
import com.fragrance.raumania.model.product.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID>, JpaSpecificationExecutor<Review> {
    List<Review> findByProductId(UUID productId);
    boolean existsByProductName(String productName);
    @Query(value =
            """
            SELECT * FROM review r
            WHERE r.product_id = :productId
            ORDER BY r.created_at DESC
            LIMIT 5
            """
            , nativeQuery = true)
    List<Review> find5LatestReviewByProductId(@Param("productId") String productId);

    @Query(value = """
   SELECT 
       ROUND(AVG(r.rating), 1) AS averageRating,
       COUNT(*) AS totalReviews,
       SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS fiveStarReviews,
       SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS fourStarReviews,
       SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS threeStarReviews,
       SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS twoStarReviews,
       SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS oneStarReviews
   FROM review r
   WHERE r.product_id = :productId
   """, nativeQuery = true)
    ReviewStatisticProjection findReviewStatisticByProductId(@Param("productId") String productId);


    List<Review> findTop10ByOrderByCreatedAtDesc();
}