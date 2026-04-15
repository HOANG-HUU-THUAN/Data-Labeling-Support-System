package com.labelingsystem.backend.modules.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long taskId;
    private Long reviewerId;
    private String status;
    private String errorCategory;
    private String comment;
    private LocalDateTime createdAt;
}
