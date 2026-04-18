package com.labelingsystem.backend.modules.export.service;

import com.labelingsystem.backend.modules.export.dto.ExportFormat;
import java.io.IOException;

public interface ExportService {
    byte[] exportProjectData(Long projectId, ExportFormat format) throws IOException;
}
