package com.labelingsystem.backend.modules.audit.service;

import com.labelingsystem.backend.common.response.PageResponse;
import com.labelingsystem.backend.modules.audit.dto.response.AuditLogResponseDTO;

public interface AuditLogService {
    void log(String action, String details);
    PageResponse<AuditLogResponseDTO> getAllLogs(int page, int size);
}
