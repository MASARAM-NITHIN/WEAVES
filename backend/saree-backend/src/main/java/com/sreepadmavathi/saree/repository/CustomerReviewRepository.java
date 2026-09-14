package com.sreepadmavathi.saree.repository;

import com.sreepadmavathi.saree.dto.ReviewAggregationDto;
import com.sreepadmavathi.saree.dto.ReviewSummaryProjection;
import com.sreepadmavathi.saree.entity.CustomerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerReviewRepository extends JpaRepository<CustomerReview, Long> {

    boolean existsByOrderItem_Id(Long orderItemId);

    // ── Per-saree: lightweight — no photo_url ──────────────────────────────
    @Query(value = """
        SELECT r.id, r.saree_id AS sareeId, s.saree_name AS sareeName,
               COALESCE(r.customer_name, c.customer_name) AS customerName,
               r.rating, r.title, r.comment,
               (r.photo_url IS NOT NULL AND r.photo_url <> '') AS hasPhoto,
               r.is_verified_purchase AS isVerifiedPurchase, r.review_date AS reviewDate
        FROM customer_reviews r
        LEFT JOIN sarees s ON r.saree_id = s.id
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.saree_id = :sareeId
        ORDER BY r.review_date DESC
        """, nativeQuery = true)
    List<ReviewSummaryProjection> findBySaree_IdOrderByReviewDateDesc(@Param("sareeId") Long sareeId);

    // ── All reviews: lightweight — no photo_url ────────────────────────────
    @Query(value = """
        SELECT r.id, r.saree_id AS sareeId, s.saree_name AS sareeName,
               COALESCE(r.customer_name, c.customer_name) AS customerName,
               r.rating, r.title, r.comment,
               (r.photo_url IS NOT NULL AND r.photo_url <> '') AS hasPhoto,
               r.is_verified_purchase AS isVerifiedPurchase, r.review_date AS reviewDate
        FROM customer_reviews r
        LEFT JOIN sarees s ON r.saree_id = s.id
        LEFT JOIN customers c ON r.customer_id = c.id
        ORDER BY r.review_date DESC
        """, nativeQuery = true)
    List<ReviewSummaryProjection> findAllByOrderByReviewDateDesc();

    @Query("SELECT new com.sreepadmavathi.saree.dto.ReviewAggregationDto(AVG(r.rating), COUNT(r)) FROM CustomerReview r WHERE r.saree.id = :sareeId")
    ReviewAggregationDto getReviewAggregationForSaree(@Param("sareeId") Long sareeId);
}
