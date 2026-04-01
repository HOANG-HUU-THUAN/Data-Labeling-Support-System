package com.labelingsystem.backend.modules.auth.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.auth.dto.request.LoginRequest;
import com.labelingsystem.backend.modules.auth.dto.request.SignupRequest;
import com.labelingsystem.backend.modules.auth.dto.response.AuthResponse;
import com.labelingsystem.backend.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        authService.signup(signUpRequest);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser() {
        // Since we are using stateless JWT, logout is primarily handled on the client side
        // by deleting the token. We return a success message here.
        return ResponseEntity.ok(ApiResponse.success("Log out successful. Please remove token on client."));
    }
}
