package com.sreepadmavathi.saree.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ThemeCollectionResponseDto {
    private Long id;
    private String collectionName;
    private String badge;
    private String description;
    private String imageUrl;
    private LocalDateTime publishedAt;
}
