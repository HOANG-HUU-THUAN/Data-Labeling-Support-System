package com.labelingsystem.backend.modules.dataset.service;

import org.springframework.web.multipart.MultipartFile;

public interface DatasetService {
    String uploadBatch(Long projectId, String datasetName, MultipartFile[] images);
}
