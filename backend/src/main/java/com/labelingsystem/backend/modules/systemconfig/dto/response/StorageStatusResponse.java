package com.labelingsystem.backend.modules.systemconfig.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StorageStatusResponse {
    long usedBytes;
    long limitBytes;
    double usedPercentage;
    String usedFormatted;
    String limitFormatted;

    // New config fields
    long maxFileSizeMB;
    long maxStoragePerProjectGB;
    java.util.List<String> allowedFileTypes;
    int maxFilesPerUpload;
}
