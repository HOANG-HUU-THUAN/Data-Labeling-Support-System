package com.labelingsystem.backend.modules.review.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    @NotNull(message = "Task ID is required")
    private Long taskId;
    
    @NotNull(message = "Status is required (APPROVED or REJECTED)")
    private String status;
    
    private String errorCategory;
    private String comment;
}
