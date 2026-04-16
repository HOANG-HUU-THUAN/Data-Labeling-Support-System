package com.labelingsystem.backend.modules.task.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskUpdateRequest {
    String name;
    List<Long> datasetIds;
    Long assigneeId;
    Long reviewerId;
}
