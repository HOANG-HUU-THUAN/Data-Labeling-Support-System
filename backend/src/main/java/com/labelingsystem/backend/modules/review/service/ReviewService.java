package com.labelingsystem.backend.modules.review.service;

import com.labelingsystem.backend.modules.review.dto.request.ReviewRequest;
import com.labelingsystem.backend.modules.review.dto.response.ReviewResponse;

public interface ReviewService {
    ReviewResponse submitReview(ReviewRequest request, Long reviewerId, boolean isAdmin);
}
