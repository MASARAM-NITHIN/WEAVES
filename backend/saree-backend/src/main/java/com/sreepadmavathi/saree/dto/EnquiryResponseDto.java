package com.sreepadmavathi.saree.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class EnquiryResponseDto {
    private String id; // We'll return the string version of the UUID
    private String enquiryCode; // INQ-XXXXX for frontend display
    private String orderId;
    private String name;
    private String email;
    private String phone;
    private String sareeInterest;
    private String message;
    private String status;
    private String date; // Formatted date string
}
