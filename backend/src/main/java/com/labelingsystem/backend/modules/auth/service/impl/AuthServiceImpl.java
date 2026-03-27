package com.labelingsystem.backend.modules.auth.service.impl;

import com.labelingsystem.backend.modules.auth.dto.request.LoginRequest;
import com.labelingsystem.backend.modules.auth.dto.request.SignupRequest;
import com.labelingsystem.backend.modules.auth.dto.response.AuthResponse;
import com.labelingsystem.backend.modules.auth.service.AuthService;
import com.labelingsystem.backend.modules.user.entity.Role;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.repository.RoleRepository;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import com.labelingsystem.backend.security.jwt.JwtTokenProvider;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String email = userDetails.getEmail();

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(email)
                .roles(roles)
                .build();
    }

    @Override
    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status("ACTIVE")
                .build();

        Set<Role> roles = new HashSet<>();
        // Default role for new users
        Role userRole = roleRepository.findByName("ANNOTATOR")
                .orElseGet(() -> {
                    Role newRole = Role.builder().name("ANNOTATOR").build();
                    return roleRepository.save(newRole);
                });
        roles.add(userRole);

        user.setRoles(roles);
        userRepository.save(user);
    }
}
