package com.labelingsystem.backend.modules.annotation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

/**
 * Save annotations for a single image inside a task.
 * By default this will replace existing annotations of the same annotator for that task+image.
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AnnotationSaveRequest {
    @NotNull(message = "Task ID cannot be null")
    Long taskId;

    @NotNull(message = "Image ID cannot be null")
    Long imageId;

    @NotEmpty(message = "Annotations cannot be empty")
    List<@Valid AnnotationItemRequest> annotations;

    /**
     * If true, soft-delete existing annotations created by current user for this task+image before inserting.
     */
    Boolean replaceExisting = true;
}

