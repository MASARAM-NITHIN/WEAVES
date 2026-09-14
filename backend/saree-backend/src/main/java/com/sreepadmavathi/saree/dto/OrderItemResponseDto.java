package com.sreepadmavathi.saree.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemResponseDto {
    private Long id;
    private Long sareeId;
    private String sareeName;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private String imageUrl;
    private Boolean isReviewed;
}
