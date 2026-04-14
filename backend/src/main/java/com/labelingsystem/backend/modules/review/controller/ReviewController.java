package com.labelingsystem.backend.modules.review.controller;

import com.labelingsystem.backend.modules.review.dto.request.ReviewRequest;
import com.labelingsystem.backend.modules.review.service.ReviewService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    private List<String> getRoles(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }


    @PostMapping("reviews/{taskId}/approve")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('REVIEWER')")
    public ResponseEntity<?> approveTask(
            @PathVariable Long taskId,
            @RequestBody(required = false) ReviewRequest request, // Có thể không cần gửi body
            Authentication auth) {
        try {
            // Tránh lỗi NullPointerException nếu Frontend không gửi gì lên
            if (request == null) request = new ReviewRequest(); 
            
            reviewService.approveTask(taskId, request, getUserId(auth), getRoles(auth));
            return ResponseEntity.ok("Task đã được PHÊ DUYỆT và KHÓA dữ liệu thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("reviews/{taskId}/reject")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('REVIEWER')")
    public ResponseEntity<?> rejectTask(
            @PathVariable Long taskId,
            @RequestBody ReviewRequest request,
            Authentication auth) {
        try {
            reviewService.rejectTask(taskId, request, getUserId(auth), getRoles(auth));
            return ResponseEntity.ok("Task đã bị TỪ CHỐI. Yêu cầu Annotator làm lại!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}