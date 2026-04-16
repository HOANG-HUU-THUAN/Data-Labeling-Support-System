package com.labelingsystem.backend.modules.review.service.impl;

import com.labelingsystem.backend.common.enums.ErrorCode;
import com.labelingsystem.backend.common.exception.CustomAppException;
import com.labelingsystem.backend.common.exception.ResourceNotFoundException;
import com.labelingsystem.backend.modules.review.dto.request.ReviewRequest;
import com.labelingsystem.backend.modules.review.dto.response.ReviewResponse;
import com.labelingsystem.backend.modules.review.entity.Review;
import com.labelingsystem.backend.modules.review.repository.ReviewRepository;
import com.labelingsystem.backend.modules.review.service.ReviewService;
import com.labelingsystem.backend.modules.task.entity.Task;
import com.labelingsystem.backend.modules.task.repository.TaskRepository;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewServiceImpl implements ReviewService {

    ReviewRepository reviewRepository;
    TaskRepository taskRepository;
    UserRepository userRepository;

    @Override
    @Transactional
    public ReviewResponse submitReview(ReviewRequest request, Long reviewerId, boolean isAdmin) {
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + request.getTaskId()));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + reviewerId));

        // Check permission: Must be the assigned reviewer or an admin
        if (!isAdmin) {
            if (task.getAssignedReviewer() == null || !task.getAssignedReviewer().getId().equals(reviewerId)) {
                throw new CustomAppException(ErrorCode.UNAUTHORIZED);
            }
        }

        // Create the Review record
        Review review = Review.builder()
                .task(task)
                .reviewer(reviewer)
                .status(request.getStatus())
                .errorCategory(request.getErrorCategory())
                .comment(request.getComment())
                .deleted(false)
                .build();
        
        Review savedReview = reviewRepository.save(review);

        // Update the Task's status (APPROVED or REJECTED)
        task.setStatus(request.getStatus());
        taskRepository.save(task);

        return ReviewResponse.builder()
                .id(savedReview.getId())
                .taskId(task.getId())
                .reviewerId(reviewer.getId())
                .status(savedReview.getStatus())
                .errorCategory(savedReview.getErrorCategory())
                .comment(savedReview.getComment())
                .createdAt(savedReview.getCreatedAt())
                .build();
    }
}
