package com.sreepadmavathi.saree.dto;

import lombok.Data;

@Data
public class CustomerResponseDto {
    private Long id;
    private String customerCode;
    private String customerName;
    private String phone;
    private String email;
    private String address;
}
