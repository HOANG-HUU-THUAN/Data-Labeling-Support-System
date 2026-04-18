package com.labelingsystem.backend.modules.export.controller;

import com.labelingsystem.backend.modules.export.dto.ExportFormat;
import com.labelingsystem.backend.modules.export.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/{projectId}/export")
    public ResponseEntity<byte[]> exportProject(
            @PathVariable Long projectId,
            @RequestParam ExportFormat format) throws IOException {

        byte[] zipData = exportService.exportProjectData(projectId, format);

        String filename = "export_project_" + projectId + "_" + format.toString().toLowerCase() + ".zip";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(zipData);
    }
}
