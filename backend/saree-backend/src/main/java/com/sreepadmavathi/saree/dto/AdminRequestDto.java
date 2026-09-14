package com.sreepadmavathi.saree.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminRequestDto {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    private String roleName;
}
