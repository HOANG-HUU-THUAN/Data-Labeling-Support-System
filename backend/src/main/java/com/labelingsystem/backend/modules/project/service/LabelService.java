package com.labelingsystem.backend.modules.project.service;

import com.labelingsystem.backend.modules.project.dto.request.LabelRequest;
import com.labelingsystem.backend.modules.project.dto.response.LabelResponse;

public interface LabelService {
    LabelResponse addLabel(Long projectId, LabelRequest request, Long userId, boolean isAdmin);
    
    LabelResponse updateLabel(Long labelId, LabelRequest request, Long userId, boolean isAdmin);

    void deleteLabel(Long labelId, Long userId, boolean isAdmin);
}