package com.labelingsystem.backend.modules.review.service.impl;

import com.labelingsystem.backend.common.enums.TaskStatus;
import com.labelingsystem.backend.modules.review.dto.request.ReviewRequest;
import com.labelingsystem.backend.modules.review.service.ReviewService;
import com.labelingsystem.backend.modules.task.entity.Task;
import com.labelingsystem.backend.modules.task.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private TaskRepository taskRepository;

    @Override
    @Transactional
    public void processReview(Long taskId, ReviewRequest request, Long reviewerId, boolean isAdmin) {
        
        // 1. Tìm Task / Find the Task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Task!"));

        // 2. Kiểm tra xem Task này đã bị khóa trước đó chưa
        // Check if the Task is already locked
        if (task.isLocked() && request.isApproved()) {
            throw new RuntimeException("Lỗi: Bản ghi này đã được phê duyệt và bị khóa từ trước!");
        }

        // 3. (Bảo mật Row-Level) - Tùy chọn: Bạn có thể check xem Reviewer này 
        // có nằm trong danh sách được phân công cho dự án này không ở đây.
        // For brevity, assuming the caller has the right role via Controller.

        // 4. Xử lý logic Phê duyệt & KHÓA (Approve & LOCK)
        if (request.isApproved()) {
            task.setStatus(TaskStatus.APPROVED);
            task.setLocked(true); // ĐÓNG CỬA KHÓA LẠI! / ENGAGE THE LOCK!
            
            // TODO (Sau này): Lưu feedback vào bảng Audit/Review Log nếu cần
        } 
        // 5. Xử lý logic Từ chối & MỞ KHÓA (Reject & UNLOCK)
        else {
            task.setStatus(TaskStatus.REJECTED);
            task.setLocked(false); // Mở khóa cho Annotator làm lại / Unlock for Annotator
            
            // Kiểm tra bắt buộc phải có feedback nếu Reject
            // Force feedback if rejected
            if (request.getFeedback() == null || request.getFeedback().trim().isEmpty()) {
                throw new RuntimeException("Lỗi: Phải nhập lý do từ chối (feedback)!");
            }
        }

        // 6. Lưu xuống DB / Save to DB
        taskRepository.save(task);
    }
}