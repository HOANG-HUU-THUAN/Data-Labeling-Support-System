package com.labelingsystem.backend.modules.review.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ReviewRequest {
    @JsonProperty("isApproved")
    private boolean isApproved;
    private String feedback;
} 
                            