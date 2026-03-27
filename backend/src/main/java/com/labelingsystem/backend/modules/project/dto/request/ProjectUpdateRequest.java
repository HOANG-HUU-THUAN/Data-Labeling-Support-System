package com.labelingsystem.backend.modules.project.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class ProjectUpdateRequest {
    private String name;
    private String description;
    private String status;
    
    private List<LabelUpdateRequest> labels; 

    @Data
    public static class LabelUpdateRequest {
        private String name;
        private String color;
    }
}