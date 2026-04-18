package com.labelingsystem.backend.modules.audit.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.common.response.PageResponse;
import com.labelingsystem.backend.modules.audit.dto.response.AuditLogResponseDTO;
import com.labelingsystem.backend.modules.audit.service.AuditLogService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasAuthority('ADMIN')")
public class AuditLogController {

    AuditLogService auditLogService;

    @GetMapping
    public ApiResponse<PageResponse<AuditLogResponseDTO>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(auditLogService.getAllLogs(page, size));
    }
}
