package com.labelingsystem.backend.modules.review.service;

import java.util.List;

import com.labelingsystem.backend.modules.review.dto.request.ReviewRequest;

public interface ReviewService {
    void approveTask(Long taskId, ReviewRequest request, Long userId, List<String> userRoles);
    void rejectTask(Long taskId, ReviewRequest request, Long userId, List<String> userRoles);
}