package com.labelingsystem.backend.modules.review.service.impl;

import com.labelingsystem.backend.modules.review.dto.request.ReviewRequest;
import com.labelingsystem.backend.modules.review.entity.Review;
import com.labelingsystem.backend.modules.review.repository.ReviewRepository;
import com.labelingsystem.backend.modules.review.service.ReviewService;
import com.labelingsystem.backend.modules.task.entity.Task;
import com.labelingsystem.backend.modules.task.repository.TaskRepository;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired private TaskRepository taskRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private UserRepository userRepository;

    // --- Helper function to check Reviewer permissions --- //
    private Task getTaskAndCheckPermission(Long taskId, Long userId, List<String> userRoles) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Task!"));

        boolean isAdmin = userRoles.contains("ADMIN") || userRoles.contains("ROLE_ADMIN");

        if (!isAdmin) {
            // If not Admin, must be the assigned Reviewer of this Task
            if (task.getAssignedReviewer() == null || !task.getAssignedReviewer().getId().equals(userId)) {
                throw new RuntimeException("Lỗi 403: Bạn không phải là người kiểm duyệt (Reviewer) của Task này!");
            }
        }
        return task;
    }


    @Override
    @Transactional
    public void approveTask(Long taskId, ReviewRequest request, Long userId, List<String> userRoles) {
        Task task = getTaskAndCheckPermission(taskId, userId, userRoles);

        if (task.isLocked()) {
            throw new RuntimeException("Lỗi: Bản ghi này đã được phê duyệt và bị khóa từ trước!");
        }

        // Update Task
        task.setStatus("APPROVED");
        task.setLocked(true);
        taskRepository.save(task);

        User reviewer = userRepository.findById(userId).orElseThrow();
        Review reviewRecord = Review.builder()
                .task(task)
                .reviewer(reviewer)
                .status("APPROVED")
                .comment(request.getComment() != null ? request.getComment() : "Đã phê duyệt.")
                .deleted(false)
                .build();
        reviewRepository.save(reviewRecord);
    }


    @Override
    @Transactional
    public void rejectTask(Long taskId, ReviewRequest request, Long userId, List<String> userRoles) {
        Task task = getTaskAndCheckPermission(taskId, userId, userRoles);

        // Feedback is mandatory when rejecting
        if (request.getComment() == null || request.getComment().trim().isEmpty()) {
            throw new RuntimeException("Lỗi: Phải nhập lý do từ chối (comment) để Annotator biết đường sửa!");
        }

        // Update Task
        task.setStatus("REJECTED");
        task.setLocked(false);
        taskRepository.save(task);

        User reviewer = userRepository.findById(userId).orElseThrow();
        Review reviewRecord = Review.builder()
                .task(task)
                .reviewer(reviewer)
                .status("REJECTED")
                .comment(request.getComment())
                .deleted(false)
                .build();
        reviewRepository.save(reviewRecord);
    }
}