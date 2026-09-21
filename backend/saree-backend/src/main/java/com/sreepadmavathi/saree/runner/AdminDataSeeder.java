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

    @Value("${owner.default.username:owner}")
    private String defaultUsername;

    @Value("${owner.default.password:padmavathi123}")
    private String defaultPassword;

    public AdminDataSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only seed the initial admin account if NO admin exists in the system.
        // Once the admin exists, the system will NOT forcefully override passwords.
        if (adminRepository.findByAdminUsername(defaultUsername).isEmpty()) {
            Admin admin = Admin.builder()
                    .adminUsername(defaultUsername)
                    .adminPassword(passwordEncoder.encode(defaultPassword))
                    .isActive(true)
                    .failedLoginAttempts(0)
                    .build();

            adminRepository.save(admin);
            System.out.println("Default admin user created with username: " + defaultUsername);
        }
    }
}
