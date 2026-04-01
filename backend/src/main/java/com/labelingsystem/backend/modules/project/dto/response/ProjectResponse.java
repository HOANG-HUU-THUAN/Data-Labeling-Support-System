package com.labelingsystem.backend.modules.project.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private String type;
    private String status;
    private LocalDateTime createdAt;
    private List<LabelResponse> labels;
    @Data
    public static class LabelResponse {
        private Long id;
        private String name;
        private String color;
    }
}