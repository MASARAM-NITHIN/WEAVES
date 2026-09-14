package com.sreepadmavathi.saree.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentUploadDto {
    @NotBlank(message = "Phone number is required to verify ownership")
    private String phone;
    
    @NotBlank(message = "UTR number is required")
    private String utrNumber;
}
