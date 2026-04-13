package com.labelingsystem.backend.modules.task.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskImageResponse {
    private Long imageId;
    private Long datasetId;
    private String filePath;
    private String thumbnailUrl;
    private String originalUrl;
    private String status;
    private LocalDateTime createdAt;
}
