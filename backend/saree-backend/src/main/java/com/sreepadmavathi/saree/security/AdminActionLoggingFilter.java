package com.sreepadmavathi.saree.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AdminActionLoggingFilter extends OncePerRequestFilter {

    private static final Logger auditLogger = LoggerFactory.getLogger("ADMIN_AUDIT");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        filterChain.doFilter(request, response);

        // We log after the filter chain completes to ensure we only log if it succeeded (or log failures)
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path.startsWith("/api/admin") && ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method))) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
                
                // Example log: [ADMIN_AUDIT] - Admin: admin_username (ID: 1) performed POST on /api/admin/collections - Status: 201
                auditLogger.info("Admin: {} (ID: {}) performed {} on {} - Status: {}", 
                        userDetails.getUsername(), 
                        userDetails.getId(), 
                        method, 
                        path, 
                        response.getStatus());
            }
        }
    }
}
