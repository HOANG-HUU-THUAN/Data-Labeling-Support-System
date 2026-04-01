package com.labelingsystem.backend.modules.project.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class LabelRequest {
    @NotBlank(message = "Tên nhãn không được để trống")
    private String name;

    @NotBlank(message = "Màu sắc không được để trống")
    private String color;
}