package com.sreepadmavathi.saree.controller;

import com.sreepadmavathi.saree.dto.ReviewResponseDto;
import com.sreepadmavathi.saree.dto.ReviewSubmitRequestDto;
import com.sreepadmavathi.saree.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<?> submitReview(@Valid @RequestBody ReviewSubmitRequestDto request) {
        try {
            ReviewResponseDto response = reviewService.submitReview(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/saree/{sareeId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsForSaree(@PathVariable Long sareeId) {
        return ResponseEntity.ok(reviewService.getReviewsForSaree(sareeId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponseDto>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getReviewPhoto(@PathVariable Long id) {
        String base64Photo = reviewService.getReviewPhotoBase64(id);
        if (base64Photo == null || base64Photo.isBlank()) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            // Strip data:image/...;base64, prefix if present
            String base64Data = base64Photo;
            int commaIndex = base64Data.indexOf(",");
            if (commaIndex != -1) {
                base64Data = base64Data.substring(commaIndex + 1);
            }
            // Remove any whitespace/newlines that might break decoding
            base64Data = base64Data.replaceAll("\\s+", "");
            
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "image/jpeg")
                    .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "max-age=31536000") // cache for 1 year
                    .body(imageBytes);
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
