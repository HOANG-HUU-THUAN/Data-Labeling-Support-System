package com.labelingsystem.backend.modules.task.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskResponse {
    Long id;
    String name;
    Long projectId;
    String projectName;
    List<Long> datasetIds;
    Long assigneeId;
    String assigneeUsername;
    Long reviewerId;
    String reviewerUsername;
    String status;
    Double progress;
    String errorCategory;
    String comment;
    LocalDateTime createdAt;
}
