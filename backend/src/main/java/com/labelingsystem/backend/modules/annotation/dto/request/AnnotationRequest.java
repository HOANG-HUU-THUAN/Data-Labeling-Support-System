package com.labelingsystem.backend.modules.annotation.dto.request;

import com.labelingsystem.backend.modules.annotation.dto.PointDTO;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnotationRequest {
    private Long imageId;
    private Long taskId; // Optional, can be inferred if null
    private Long labelId;
    private Double x;
    private Double y;
    private Double w;
    private Double h;
    private String type; // BOX, POLYGON, etc.
    private List<PointDTO> points;
}
