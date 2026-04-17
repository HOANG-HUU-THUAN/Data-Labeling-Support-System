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
public class MyTaskResponse {
    private Long taskId;
    private Long projectId;
    private String projectName;
    private String status;
    private Long assignedAnnotatorId;
    private String assignedAnnotatorUsername;
    private Long assignedReviewerId;
    private String assignedReviewerUsername;
    private int imageCount;
    private String errorCategory;
    private String comment;
    private LocalDateTime createdAt;
}
