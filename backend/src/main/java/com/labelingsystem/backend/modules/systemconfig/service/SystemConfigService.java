package com.labelingsystem.backend.modules.systemconfig.service;

import java.util.List;

public interface SystemConfigService {
    String getConfigValue(String key, String defaultValue);
    long getMaxStorageLimitBytes();
    long getMaxFileSizeNodes();
    long getMaxStoragePerProjectBytes();
    List<String> getAllowedFileTypes();
    int getMaxFilesPerUpload();
    void updateConfig(String key, String value);
}
