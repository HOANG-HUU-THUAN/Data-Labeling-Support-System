package com.labelingsystem.backend.modules.systemconfig.service.impl;

import com.labelingsystem.backend.modules.systemconfig.entity.SystemConfig;
import com.labelingsystem.backend.modules.systemconfig.repository.SystemConfigRepository;
import com.labelingsystem.backend.modules.systemconfig.service.SystemConfigService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemConfigServiceImpl implements SystemConfigService {

    SystemConfigRepository systemConfigRepository;

    private static final String MAX_STORAGE_LIMIT_KEY = "MAX_STORAGE_GB";
    private static final String DEFAULT_STORAGE_LIMIT_GB = "100";

    @Override
    public String getConfigValue(String key, String defaultValue) {
        return systemConfigRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }

    @Override
    public long getMaxStorageLimitBytes() {
        String gbStr = getConfigValue("MAX_STORAGE_GB", "100");
        return (long) (Double.parseDouble(gbStr) * 1024 * 1024 * 1024);
    }

    @Override
    public long getMaxFileSizeNodes() {
        String mbStr = getConfigValue("MAX_FILE_SIZE_MB", "10");
        return (long) (Double.parseDouble(mbStr) * 1024 * 1024);
    }

    @Override
    public long getMaxStoragePerProjectBytes() {
        String gbStr = getConfigValue("MAX_STORAGE_PER_PROJECT_GB", "20");
        return (long) (Double.parseDouble(gbStr) * 1024 * 1024 * 1024);
    }

    @Override
    public java.util.List<String> getAllowedFileTypes() {
        String types = getConfigValue("ALLOWED_FILE_TYPES", ".jpg,.png,.jpeg");
        return java.util.Arrays.asList(types.split(","));
    }

    @Override
    public int getMaxFilesPerUpload() {
        String val = getConfigValue("MAX_FILES_PER_UPLOAD", "100");
        return Integer.parseInt(val);
    }

    @Transactional
    public void updateConfig(String key, String value) {
        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElse(SystemConfig.builder().configKey(key).build());
        config.setConfigValue(value);
        systemConfigRepository.save(config);
    }
}
