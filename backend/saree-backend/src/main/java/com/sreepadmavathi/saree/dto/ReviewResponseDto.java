package com.sreepadmavathi.saree.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponseDto {
    private Long id;
    private Long sareeId;
    private String sareeName;
    private String customerName;
    private Short rating;
    private String title;
    private String comment;
    private String photoUrl;       // Only populated for single-review fetch; null in list responses
    private Boolean hasPhoto;      // True if review has a photo (doesn't send the full base64)
    private Boolean isVerifiedPurchase;
    private LocalDateTime reviewDate;
}
