package com.sreepadmavathi.saree.runner;

import com.sreepadmavathi.saree.entity.Admin;
import com.sreepadmavathi.saree.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminDataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_USERNAME:}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    public AdminDataSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // If the user provides ADMIN_USERNAME and ADMIN_PASSWORD via environment variables,
        // we ensure that account exists and has the exact password provided in the env var.
        // This removes hardcoded credentials from the source code.
        if (adminUsername != null && !adminUsername.trim().isEmpty() && 
            adminPassword != null && !adminPassword.trim().isEmpty()) {
            
            adminRepository.findByAdminUsername(adminUsername).ifPresentOrElse(
                existingAdmin -> {
                    // Update existing admin with the environment variables (resets lockouts)
                    existingAdmin.setAdminPassword(passwordEncoder.encode(adminPassword));
                    existingAdmin.setFailedLoginAttempts(0);
                    existingAdmin.setLockoutUntil(null);
                    existingAdmin.setIsActive(true);
                    adminRepository.save(existingAdmin);
                    System.out.println("Admin account synced with environment variables: " + adminUsername);
                },
                () -> {
                    // Create new admin from environment variables
                    Admin newAdmin = Admin.builder()
                            .adminUsername(adminUsername)
                            .adminPassword(passwordEncoder.encode(adminPassword))
                            .isActive(true)
                            .failedLoginAttempts(0)
                            .build();
                    adminRepository.save(newAdmin);
                    System.out.println("New admin account created from environment variables: " + adminUsername);
                }
            );
        } else {
            System.out.println("No ADMIN_USERNAME / ADMIN_PASSWORD env variables found. Skipping admin seed.");
        }
    }
}
