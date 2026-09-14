package com.sreepadmavathi.saree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewAggregationDto {
    private Double avgRating;
    private Long ratingCount;
}
