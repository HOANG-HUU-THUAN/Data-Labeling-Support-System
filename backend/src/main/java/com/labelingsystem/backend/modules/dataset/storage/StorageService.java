package com.labelingsystem.backend.modules.dataset.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String prefix);
    Resource loadAsResource(String filename);
    Resource loadThumbnailAsResource(String filename);
}
