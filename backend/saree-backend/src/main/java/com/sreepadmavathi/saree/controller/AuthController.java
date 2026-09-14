package com.sreepadmavathi.saree.controller;

import com.sreepadmavathi.saree.dto.AdminLoginRequestDto;
import com.sreepadmavathi.saree.dto.AuthResponseDto;
import com.sreepadmavathi.saree.dto.RefreshTokenRequestDto;
import com.sreepadmavathi.saree.repository.AdminRepository;
import com.sreepadmavathi.saree.security.CustomUserDetails;
import com.sreepadmavathi.saree.security.CustomUserDetailsService;
import com.sreepadmavathi.saree.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private final AdminRepository adminRepository;

    public AuthController(AuthenticationManager authenticationManager, 
                          JwtUtils jwtUtils, 
                          CustomUserDetailsService userDetailsService,
                          AdminRepository adminRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        this.adminRepository = adminRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAdmin(@Valid @RequestBody AdminLoginRequestDto loginRequest) {
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            // Reset failed attempts on success
            adminRepository.resetFailedLoginAttempts(loginRequest.getUsername());

            String jwt = jwtUtils.generateAccessToken(userDetails);
            String refreshJwt = jwtUtils.generateRefreshToken(userDetails);

            return ResponseEntity.ok(new AuthResponseDto(jwt, refreshJwt, userDetails.getId(),
                    userDetails.getUsername(), userDetails.getRoleName()));
                    
        } catch (AuthenticationException e) {
            // Check if username exists and increment failed attempts
            adminRepository.findByAdminUsername(loginRequest.getUsername()).ifPresent(admin -> {
                adminRepository.incrementFailedLoginAttempts(loginRequest.getUsername());
                // Lock account if failed attempts reaches 5
                if (admin.getFailedLoginAttempts() + 1 >= 5) {
                    adminRepository.lockAccount(loginRequest.getUsername(), LocalDateTime.now().plusMinutes(15));
                }
            });
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Bad credentials or locked account"));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) {
        String requestRefreshToken = request.getRefreshToken();

        if (jwtUtils.validateJwtToken(requestRefreshToken) && jwtUtils.isRefreshToken(requestRefreshToken)) {
            String username = jwtUtils.getUserNameFromJwtToken(requestRefreshToken);
            CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);

            String accessToken = jwtUtils.generateAccessToken(userDetails);
            String newRefreshToken = jwtUtils.generateRefreshToken(userDetails);

            return ResponseEntity.ok(new AuthResponseDto(accessToken, newRefreshToken, userDetails.getId(),
                    userDetails.getUsername(), userDetails.getRoleName()));
        }

        return ResponseEntity.badRequest().body("Invalid or expired refresh token");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutAdmin() {
        // In a stateless JWT architecture, logout is primarily handled by the client discarding the token.
        // If you were to implement a token blacklist, you would add the logic here.
        return ResponseEntity.ok().body("Logged out successfully");
    }
}
