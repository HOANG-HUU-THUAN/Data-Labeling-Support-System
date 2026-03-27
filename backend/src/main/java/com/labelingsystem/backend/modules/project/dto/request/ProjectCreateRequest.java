package com.labelingsystem.backend.modules.project.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class ProjectCreateRequest {
    private String name;
    private String description;
    private List<LabelRequest> labels;

    @Data
    public static class LabelRequest {
        private String name;
        private String color;
    }
}