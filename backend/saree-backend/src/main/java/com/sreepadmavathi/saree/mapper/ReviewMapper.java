package com.sreepadmavathi.saree.mapper;

import com.sreepadmavathi.saree.dto.ReviewResponseDto;
import com.sreepadmavathi.saree.dto.ReviewSummaryProjection;
import com.sreepadmavathi.saree.entity.CustomerReview;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    /**
     * Maps the lightweight projection (no photo_url) to the response DTO.
     * Used for list endpoints — fast because photo_url was never loaded from DB.
     */
    public ReviewResponseDto fromProjection(ReviewSummaryProjection p) {
        if (p == null) return null;
        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(p.getId());
        dto.setSareeId(p.getSareeId());
        dto.setSareeName(p.getSareeName());
        dto.setCustomerName(p.getCustomerName());
        dto.setRating(p.getRating());
        dto.setTitle(p.getTitle());
        dto.setComment(p.getComment());
        dto.setPhotoUrl(null);
        dto.setHasPhoto(Boolean.TRUE.equals(p.getHasPhoto()));
        dto.setIsVerifiedPurchase(p.getIsVerifiedPurchase());
        dto.setReviewDate(p.getReviewDate());
        return dto;
    }

    /**
     * Full entity mapper — used only for the submit response where we have
     * the full entity already in memory (no extra DB round trip).
     */
    public ReviewResponseDto toResponseDto(CustomerReview review) {
        if (review == null) return null;
        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(review.getId());
        if (review.getSaree() != null) {
            dto.setSareeId(review.getSaree().getId());
            dto.setSareeName(review.getSaree().getSareeName());
        }
        dto.setCustomerName(review.getResolvedCustomerName());
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setComment(review.getComment());
        dto.setPhotoUrl(null);
        dto.setHasPhoto(review.getPhotoUrl() != null && !review.getPhotoUrl().isBlank());
        dto.setIsVerifiedPurchase(review.getIsVerifiedPurchase());
        dto.setReviewDate(review.getReviewDate());
        return dto;
    }
}
