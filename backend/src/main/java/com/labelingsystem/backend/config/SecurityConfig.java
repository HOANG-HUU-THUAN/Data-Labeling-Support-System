package com.labelingsystem.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                // Tắt bảo vệ CSRF (bắt buộc đối với các REST API thuần túy không dùng Session)
                .csrf(AbstractHttpConfigurer::disable)
                
                // Tạm thời mở toàn bộ quyền truy cập (permit All) cho mọi endpoint để dễ dàng test CRUD bằng Postman.
                // TODO: Cập nhật lại config này sau khi tạo xong JwtAuthenticationFilter (bảo mật thực sự)
                .authorizeHttpRequests(request -> request
                        .anyRequest().permitAll()
                )
                
                // Chuyển việc quản lý phiên lưu trữ sang chế độ không trạng thái (STATELESS) chuyên cho API
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return httpSecurity.build();
    }
}
