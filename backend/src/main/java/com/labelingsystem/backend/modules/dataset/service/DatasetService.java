package com.labelingsystem.backend.modules.dataset.service;

import com.labelingsystem.backend.modules.dataset.dto.response.DatasetResponse;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface DatasetService {
    String uploadBatch(Long projectId, String datasetName, MultipartFile[] images);
    
    List<DatasetResponse> getDatasetsByProjectId(Long projectId);
    List<DatasetResponse> getDatasetsByIds(List<Long> ids);
    void deleteDataset(Long id);
}
