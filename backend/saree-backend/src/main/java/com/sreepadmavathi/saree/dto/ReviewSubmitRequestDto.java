package com.sreepadmavathi.saree.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewSubmitRequestDto {
    @NotBlank(message = "Order code is required")
    private String orderCode;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be 10 digits")
    private String phone;

    @NotNull(message = "Saree ID is required")
    private Long sareeId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Short rating;

    private String comment;

    private String title;

    private String photoUrl;
}
