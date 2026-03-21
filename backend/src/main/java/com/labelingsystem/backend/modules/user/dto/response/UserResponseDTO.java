package com.labelingsystem.backend.modules.user.dto.response;

import java.time.LocalDateTime;
import java.util.Set;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponseDTO {
    Long id;
    String username;
    String email;
    String status;
    boolean deleted;
    LocalDateTime createdAt;
    Set<String> roles;
}
