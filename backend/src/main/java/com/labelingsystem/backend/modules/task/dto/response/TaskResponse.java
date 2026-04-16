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
    Long projectId;
    List<Long> datasetIds;
    Long assigneeId;
    Long reviewerId;
    String status;
    Double progress;
    LocalDateTime createdAt;
}
