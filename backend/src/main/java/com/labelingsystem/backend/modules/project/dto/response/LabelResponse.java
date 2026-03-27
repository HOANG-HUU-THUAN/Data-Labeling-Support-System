package com.labelingsystem.backend.modules.project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabelResponse {
    private Long id;
    private String name;
    private String color;
    private Long projectId;
}