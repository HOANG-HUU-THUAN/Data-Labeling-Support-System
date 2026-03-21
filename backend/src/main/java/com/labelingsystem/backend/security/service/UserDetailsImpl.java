package com.labelingsystem.backend.security.service;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.labelingsystem.backend.modules.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;
    private LocalDateTime createdAt;

    @JsonIgnore 
    private String password;

    // This is Spring Security's standard Role list
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String email, String password, LocalDateTime createdAt,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.authorities = authorities;
    }

    // Build method: Takes your custom User class and returns Spring Security's UserDetailsImpl
    public static UserDetailsImpl build(User user) {
        // Converts your Set<Role> to Spring's List<GrantedAuthority>
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getCreatedAt(),
                authorities);
    }

    // --- GETTER METHODS OF USERDETAILS INTERFACE (MANDATORY) ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return username; }
    

    // Account status checks. For simplicity, we return true (Account is always active)
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}