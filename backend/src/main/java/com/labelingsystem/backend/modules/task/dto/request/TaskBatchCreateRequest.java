package com.labelingsystem.backend.modules.task.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskBatchCreateRequest {
    
    @NotNull(message = "Dataset ID cannot be null")
    Long datasetId;
    
    @Min(value = 1, message = "Images per task must be at least 1")
    int imagesPerTask;
    
    @NotEmpty(message = "Annotator list cannot be empty")
    List<Long> annotatorIds;
    
    List<Long> reviewerIds;
}
