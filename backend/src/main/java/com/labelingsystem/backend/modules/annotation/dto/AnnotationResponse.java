package com.labelingsystem.backend.modules.annotation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnotationResponse {
    private Long id;
    private Long imageId;
    private Long labelId;
    private Double x;
    private Double y;
    private Double w;
    private Double h;
    private String type;
}
