package com.sreepadmavathi.saree.security;

import com.sreepadmavathi.saree.entity.Admin;
import com.sreepadmavathi.saree.repository.AdminRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    public CustomUserDetailsService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Admin admin = adminRepository.findByAdminUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin Not Found with username: " + username));

        if (admin.getLockoutUntil() != null && admin.getLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new org.springframework.security.authentication.LockedException("Account is temporarily locked due to multiple failed login attempts. Try again later.");
        } else if (admin.getLockoutUntil() != null && admin.getLockoutUntil().isBefore(LocalDateTime.now())) {
            // Unlock account if lockout time has passed
            adminRepository.resetFailedLoginAttempts(username);
        }

        return CustomUserDetails.build(admin);
    }
}
