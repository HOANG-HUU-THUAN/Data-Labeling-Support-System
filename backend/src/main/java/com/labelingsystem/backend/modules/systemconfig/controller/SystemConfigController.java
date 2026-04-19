package com.labelingsystem.backend.modules.systemconfig.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.dataset.storage.StorageService;
import com.labelingsystem.backend.modules.systemconfig.dto.response.StorageStatusResponse;
import com.labelingsystem.backend.modules.systemconfig.service.SystemConfigService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system-configs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemConfigController {

    SystemConfigService systemConfigService;
    StorageService storageService;

    @GetMapping("/storage-status")
    public ApiResponse<StorageStatusResponse> getStorageStatus() {
        long used = storageService.getTotalUsedSize();
        long limit = systemConfigService.getMaxStorageLimitBytes();

        StorageStatusResponse response = StorageStatusResponse.builder()
                .usedBytes(used)
                .limitBytes(limit)
                .usedPercentage(limit > 0 ? (double) used / limit * 100 : 0)
                .usedFormatted(formatBytes(used))
                .limitFormatted(formatBytes(limit))
                .maxFileSizeMB(systemConfigService.getMaxFileSizeNodes() / (1024 * 1024))
                .maxStoragePerProjectGB(systemConfigService.getMaxStoragePerProjectBytes() / (1024 * 1024 * 1024))
                .allowedFileTypes(systemConfigService.getAllowedFileTypes())
                .maxFilesPerUpload(systemConfigService.getMaxFilesPerUpload())
                .build();

        return ApiResponse.<StorageStatusResponse>builder()
                .data(response)
                .build();
    }

    @PutMapping("/update-config")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<String> updateConfig(@RequestParam String key, @RequestParam String value) {
        systemConfigService.updateConfig(key, value);
        return ApiResponse.<String>builder()
                .data("Config " + key + " updated successfully")
                .build();
    }

    private String formatBytes(long bytes) {
        if (bytes <= 0) return "0 B";
        if (bytes < 1024)
            return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = String.valueOf("KMGTPE".charAt(exp - 1));
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
