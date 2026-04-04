package com.labelingsystem.backend.modules.review.service;

import com.labelingsystem.backend.modules.review.dto.request.ReviewRequest;

public interface ReviewService {
    void processReview(Long taskId, ReviewRequest request, Long reviewerId, boolean isAdmin);
}