package com.labelingsystem.backend.modules.dataset.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetResponse {
    private Long id;
    private String name;
    private Long projectId;
    private int imageCount;
    private LocalDateTime createdAt;
}
