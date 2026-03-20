package com.labelingsystem.backend.config;

import com.labelingsystem.backend.security.service.CustomUserDetailsService;
import com.labelingsystem.backend.security.entrypoint.JwtAuthEntryPointJwt;
import com.labelingsystem.backend.security.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired CustomUserDetailsService customUserDetailsService;
    @Autowired JwtAuthEntryPointJwt unauthorizedHandler;

    // Initialize the "Ticket Inspector"
    @Bean
    public JwtAuthenticationFilter authenticationJwtTokenFilter() {
        return new JwtAuthenticationFilter();
    }

    // Configure Authentication Provider (Uses our UserDetailsService and PasswordEncoder)
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Configure Authentication Manager (Used to call authenticate() in AuthController)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Industry-standard password hashing tool
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // --- THE MAIN SECURITY CHAIN ---
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // 1. Disable CSRF (Since we use JWT instead of Session Cookies, CSRF is not a threat)
        http.csrf(csrf -> csrf.disable())

            // 2. Set unauthorized error handler (Uses our Bouncer)
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))

            // 3. Disable Session (STATELESS) because every request must include JWT, server remembers nothing
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. Authorize API endpoints
            .authorizeHttpRequests(auth -> 
                auth.requestMatchers("/api/auth/**").permitAll() 
                    .requestMatchers("/api/test/**").permitAll()
                    .requestMatchers("/error").permitAll()
                    .anyRequest().authenticated()
            );

        // Register our Provider to the system
        http.authenticationProvider(authenticationProvider());

        // INSERT TICKET INSPECTOR: Tell Spring Security to run our AuthTokenFilter BEFORE its default UsernamePassword filter
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}