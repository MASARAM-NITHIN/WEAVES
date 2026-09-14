package com.sreepadmavathi.saree.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SareeResponseDto {
    private Long id;
    private String sareeName;
    private Long fabricTypeId;
    private String fabricTypeName;
    private java.util.List<Long> collectionIds;
    private java.util.List<String> collectionNames;
    private String description;
    private String imageUrl;
    private BigDecimal actualPrice;
    private BigDecimal discountPercent;
    private BigDecimal discountedPrice;
    private Integer stockAvailable;
    private Boolean inStock;
    private Boolean isNew;
    private Boolean isBestSeller;
    private BigDecimal avgRating;
    private Integer ratingCount;
    private LocalDateTime publishedAt;
}
