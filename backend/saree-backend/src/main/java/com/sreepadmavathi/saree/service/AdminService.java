package com.sreepadmavathi.saree.service;

import com.sreepadmavathi.saree.dto.AdminRequestDto;
import com.sreepadmavathi.saree.dto.AdminResponseDto;
import com.sreepadmavathi.saree.entity.Admin;
import com.sreepadmavathi.saree.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AdminResponseDto createAdmin(AdminRequestDto request) {
        if (adminRepository.findByAdminUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        Admin admin = new Admin();
        admin.setAdminUsername(request.getUsername());
        admin.setAdminPassword(passwordEncoder.encode(request.getPassword()));
        admin.setIsActive(true);
        admin.setFailedLoginAttempts(0);

        Admin saved = adminRepository.save(admin);
        return mapToResponse(saved);
    }

    @Transactional
    public AdminResponseDto deactivateAdmin(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        admin.setIsActive(false);
        return mapToResponse(adminRepository.save(admin));
    }

    public List<AdminResponseDto> getAllAdmins() {
        return adminRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AdminResponseDto mapToResponse(Admin admin) {
        return new AdminResponseDto(
                admin.getId(),
                admin.getAdminUsername(),
                "OWNER",
                admin.getIsActive()
        );
    }
}
