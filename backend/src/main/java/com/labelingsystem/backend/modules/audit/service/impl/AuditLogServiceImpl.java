package com.labelingsystem.backend.modules.audit.service.impl;

import com.labelingsystem.backend.common.response.PageResponse;
import com.labelingsystem.backend.modules.audit.dto.response.AuditLogResponseDTO;
import com.labelingsystem.backend.modules.audit.entity.AuditLog;
import com.labelingsystem.backend.modules.audit.repository.AuditLogRepository;
import com.labelingsystem.backend.modules.audit.service.AuditLogService;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuditLogServiceImpl implements AuditLogService {

    AuditLogRepository auditLogRepository;
    UserRepository userRepository;
    HttpServletRequest request;

    @Override
    public void log(String action, String details) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);
        
        String ipAddress = request.getRemoteAddr();

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .details(details)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
    }

    @Override
    public PageResponse<AuditLogResponseDTO> getAllLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> auditLogsPage = auditLogRepository.findAll(pageable);

        List<AuditLogResponseDTO> dtoList = auditLogsPage.getContent().stream()
                .map(log -> AuditLogResponseDTO.builder()
                        .id(log.getId())
                        .username(log.getUser() != null ? log.getUser().getUsername() : "SYSTEM")
                        .action(log.getAction())
                        .ipAddress(log.getIpAddress())
                        .details(log.getDetails())
                        .createdAt(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.<AuditLogResponseDTO>builder()
                .pageNumber(auditLogsPage.getNumber())
                .pageSize(auditLogsPage.getSize())
                .totalElements(auditLogsPage.getTotalElements())
                .totalPages(auditLogsPage.getTotalPages())
                .last(auditLogsPage.isLast())
                .data(dtoList)
                .build();
    }
}
