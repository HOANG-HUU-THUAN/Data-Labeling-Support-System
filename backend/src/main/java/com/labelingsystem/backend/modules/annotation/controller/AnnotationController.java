package com.labelingsystem.backend.modules.annotation.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.annotation.dto.request.AnnotationRequest;
import com.labelingsystem.backend.modules.annotation.dto.response.AnnotationResponse;
import com.labelingsystem.backend.modules.annotation.dto.request.ReplaceAnnotationsRequest;
import com.labelingsystem.backend.modules.annotation.service.AnnotationService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AnnotationController {

    private final AnnotationService annotationService;

    @PostMapping("/images/{imageId}/lock")
    public ApiResponse<Map<String, Boolean>> lockImage(@PathVariable Long imageId, Authentication authentication) {
        // Simple implementation: always return true for now to unblock frontend
        // In a real app, you'd check if someone else has locked it.
        return ApiResponse.success(Map.of("locked", true));
    }

    @PostMapping("/images/{imageId}/unlock")
    public ApiResponse<String> unlockImage(@PathVariable Long imageId) {
        return ApiResponse.success("Unlocked");
    }

    @GetMapping("/images/{imageId}/annotations")
    public ApiResponse<List<AnnotationResponse>> getAnnotationsByImage(@PathVariable Long imageId) {
        return ApiResponse.success(annotationService.getAnnotationsByImage(imageId));
    }

    @PostMapping("/annotations")
    public ApiResponse<AnnotationResponse> createAnnotation(@Valid @RequestBody AnnotationRequest request) {
        return ApiResponse.success(annotationService.createAnnotation(request));
    }

    @PutMapping("/annotations/{id}")
    public ApiResponse<AnnotationResponse> updateAnnotation(
            @PathVariable Long id,
            @RequestBody AnnotationRequest request) {
        return ApiResponse.success(annotationService.updateAnnotation(id, request));
    }

    @DeleteMapping("/annotations/{id}")
    public ApiResponse<String> deleteAnnotation(@PathVariable Long id) {
        annotationService.deleteAnnotation(id);
        return ApiResponse.success("Deleted");
    }

    @PutMapping("/images/{imageId}/annotations/replace")
    public ApiResponse<String> replaceAnnotations(
            @PathVariable Long imageId,
            @RequestBody ReplaceAnnotationsRequest request) {
        annotationService.replaceAnnotationsForImage(imageId, request.getReplacements());
        return ApiResponse.success("Replaced");
    }
}
