package com.labelingsystem.backend.modules.annotation.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReplaceAnnotationsRequest {
    private List<AnnotationRequest> replacements;
}
