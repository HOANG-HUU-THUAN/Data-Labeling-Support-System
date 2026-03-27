package com.labelingsystem.backend.modules.auth.service;

import com.labelingsystem.backend.modules.auth.dto.request.LoginRequest;
import com.labelingsystem.backend.modules.auth.dto.request.SignupRequest;
import com.labelingsystem.backend.modules.auth.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    void signup(SignupRequest request);
}
