package com.labelingsystem.backend.modules.project.dto.request;

import lombok.Data;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
public class ProjectCreateRequest {
    @NotBlank(message = "Tên dự án không được để trống")
    @Size(max = 256, message = "Tên dự án không vượt quá 256 ký tự")
    private String name;

    private String description;

    @NotBlank(message = "Loại dự án không được để trống")
    private String type;

    private String guideline;

    @Valid
    private List<LabelRequest> labels;

    @Data
    public static class LabelRequest {
        @NotBlank(message = "Tên nhãn không được để trống")
        private String name;

        @NotBlank(message = "Màu sắc không được để trống")
        private String color;
    }
}