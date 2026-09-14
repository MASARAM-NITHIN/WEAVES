package com.sreepadmavathi.saree.dto;

import java.time.LocalDateTime;

public interface ReviewSummaryProjection {
    Long getId();
    Long getSareeId();
    String getSareeName();
    String getCustomerName();
    Short getRating();
    String getTitle();
    String getComment();
    Boolean getHasPhoto();
    Boolean getIsVerifiedPurchase();
    LocalDateTime getReviewDate();
}
