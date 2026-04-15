package com.labelingsystem.backend.modules.annotation.service;

import com.labelingsystem.backend.modules.annotation.dto.AnnotationRequest;
import com.labelingsystem.backend.modules.annotation.dto.AnnotationResponse;
import java.util.List;

public interface AnnotationService {
    List<AnnotationResponse> getAnnotationsByImage(Long imageId);
    
    AnnotationResponse createAnnotation(AnnotationRequest request);
    
    AnnotationResponse updateAnnotation(Long id, AnnotationRequest request);
    
    void deleteAnnotation(Long id);
    
    void replaceAnnotationsForImage(Long imageId, List<AnnotationRequest> replacements);
}
