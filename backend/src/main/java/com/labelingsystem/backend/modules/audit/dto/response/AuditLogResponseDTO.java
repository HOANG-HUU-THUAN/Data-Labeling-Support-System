package com.labelingsystem.backend.modules.audit.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuditLogResponseDTO {
    Long id;
    String username;
    String action;
    String ipAddress;
    String details;
    LocalDateTime createdAt;
}
