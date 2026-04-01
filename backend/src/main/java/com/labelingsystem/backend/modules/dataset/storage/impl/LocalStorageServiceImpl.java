package com.labelingsystem.backend.modules.dataset.storage.impl;

import com.labelingsystem.backend.config.StorageConfig;
import com.labelingsystem.backend.modules.dataset.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocalStorageServiceImpl implements StorageService {

    private final StorageConfig storageConfig;

    @Override
    public String store(MultipartFile file, String prefix) {
        try {
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String extension = "";
            int i = originalFilename.lastIndexOf('.');
            if (i > 0) {
                extension = originalFilename.substring(i);
            }
            
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            String relativePath = (prefix != null && !prefix.isEmpty()) ? prefix + "/" + uniqueFilename : uniqueFilename;
            
            Path uploadPath = Paths.get(storageConfig.getLocalDir()).toAbsolutePath().normalize();
            Path targetLocation = uploadPath.resolve(relativePath).normalize();

            // Create directories if they do not exist
            Files.createDirectories(targetLocation.getParent());

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return relativePath;
        } catch (IOException ex) {
            log.error("Could not store file.", ex);
            throw new RuntimeException("Could not store file. Please try again!", ex); // Should replace with custom exception in future
        }
    }
}
