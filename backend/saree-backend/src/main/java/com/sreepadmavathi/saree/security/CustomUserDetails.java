package com.sreepadmavathi.saree.security;

import com.sreepadmavathi.saree.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {
    private Long id;
    private String username;
    private String password;
    private String roleName;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean isActive;

    public static CustomUserDetails build(Admin admin) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_OWNER");

        return new CustomUserDetails(
                admin.getId(),
                admin.getAdminUsername(),
                admin.getAdminPassword(),
                "OWNER",
                Collections.singletonList(authority),
                admin.getIsActive() != null ? admin.getIsActive() : true
        );
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
