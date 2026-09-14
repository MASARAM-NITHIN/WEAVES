package com.sreepadmavathi.saree.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FabricTypeRequestDto {
    @NotBlank(message = "Fabric name is required")
    private String fabricName;
    private String description;
    private String imageUrl;
}
