package com.labelingsystem.backend.modules.project.dto.request;

import lombok.Data;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class ProjectUpdateRequest {
    @Size(max = 256, message = "Tên dự án không vượt quá 256 ký tự")
    private String name;

    private String description;
    private String status;
    private String type;
    
    @Valid
    private List<LabelUpdateRequest> labels; 

    @Data
    public static class LabelUpdateRequest {
        @NotBlank(message = "Tên nhãn không được để trống")
        private String name;

        @NotBlank(message = "Màu sắc không được để trống")
        private String color;
    }
}