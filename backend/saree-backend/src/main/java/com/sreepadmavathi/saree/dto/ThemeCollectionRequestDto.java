package com.sreepadmavathi.saree.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ThemeCollectionRequestDto {
    @NotBlank(message = "Collection name is required")
    private String collectionName;
    private String badge;
    private String description;
    private String imageUrl;
}
