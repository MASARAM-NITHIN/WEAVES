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
        if (adminRepository.findByAdminUsername(defaultUsername).isEmpty()) {
            Admin admin = Admin.builder()
                    .adminUsername(defaultUsername)
                    .adminPassword(passwordEncoder.encode(defaultPassword))
                    .isActive(true)
                    .failedLoginAttempts(0)
                    .build();

            adminRepository.save(admin);
            System.out.println("Default admin user created with username: " + defaultUsername);
        } else {
            // Force reset the password to padmavathi123 to ensure the user can log in
            // and unlock the account if it was locked.
            Admin existingAdmin = adminRepository.findByAdminUsername(defaultUsername).get();
            existingAdmin.setAdminPassword(passwordEncoder.encode(defaultPassword));
            existingAdmin.setFailedLoginAttempts(0);
            existingAdmin.setLockoutUntil(null);
            existingAdmin.setIsActive(true);
            adminRepository.save(existingAdmin);
            System.out.println("Force reset admin user password and unlocked account.");
        }
    }
}
