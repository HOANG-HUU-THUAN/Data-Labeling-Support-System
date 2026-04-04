package com.labelingsystem.backend.modules.review.controller;

import com.labelingsystem.backend.modules.review.dto.request.ReviewRequest;
import com.labelingsystem.backend.modules.review.service.ReviewService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;
    @PostMapping("/tasks/{taskId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER') or hasAuthority('REVIEWER')")
    public ResponseEntity<?> reviewTask(
            @PathVariable Long taskId,
            @RequestBody ReviewRequest request,
            Authentication auth) {
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            Long reviewerId = userDetails.getId();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().contains("ADMIN"));

            reviewService.processReview(taskId, request, reviewerId, isAdmin);
            
            String message = request.isApproved() 
                    ? "Đã PHÊ DUYỆT và KHÓA task thành công!" 
                    : "Đã TỪ CHỐI task, yêu cầu Annotator làm lại!";
            
            return ResponseEntity.ok(message);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}