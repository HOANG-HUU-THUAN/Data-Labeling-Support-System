package com.labelingsystem.backend.modules.user.mapper;

import com.labelingsystem.backend.modules.user.dto.request.UserCreationDTO;
import com.labelingsystem.backend.modules.user.dto.request.UserUpdateDTO;
import com.labelingsystem.backend.modules.user.dto.response.UserResponseDTO;
import com.labelingsystem.backend.modules.user.entity.Role;
import com.labelingsystem.backend.modules.user.entity.User;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toUser(UserCreationDTO request) {
        if (request == null) {
            return null;
        }

        return User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .email(request.getEmail())
                .build();
    }

    public void updateUserFromDTO(UserUpdateDTO request, User user) {
        if (request == null) {
            return;
        }

        if (request.getPassword() != null) {
            user.setPassword(request.getPassword());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
    }

    public UserResponseDTO toUserResponseDTO(User user) {
        if (user == null) {
            return null;
        }
        
        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.getStatus())
                .deleted(user.isDeleted())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles() != null ? user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()) : null)
                .build();
    }
}
