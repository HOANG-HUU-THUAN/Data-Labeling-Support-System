package com.labelingsystem.backend.modules.review.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.review.dto.request.ReviewRequest;
import com.labelingsystem.backend.modules.review.dto.response.ReviewResponse;
import com.labelingsystem.backend.modules.review.service.ReviewService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {

    ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasAuthority('REVIEWER') or hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<ReviewResponse> submitReview(
            @RequestBody @Valid ReviewRequest request,
            Authentication authentication) {
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));
        
        return ApiResponse.success(reviewService.submitReview(request, userDetails.getId(), isAdmin));
    }
}
