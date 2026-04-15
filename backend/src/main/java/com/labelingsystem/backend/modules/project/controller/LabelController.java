package com.labelingsystem.backend.modules.project.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.project.dto.request.LabelRequest;
import com.labelingsystem.backend.modules.project.dto.response.LabelResponse;
import com.labelingsystem.backend.modules.project.service.LabelService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
//@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LabelController {

    LabelService labelService;

    // Helper method to get Auth info
    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }
    
    private boolean checkAdmin(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));
    }

    // ==========================================
    // GET LABELS BY PROJECT
    // ==========================================
    @GetMapping("/api/projects/{projectId}/labels")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER') or hasAuthority('ANNOTATOR') or hasAuthority('REVIEWER')")
    public ApiResponse<List<LabelResponse>> getLabelsByProject(@PathVariable Long projectId) {
        return ApiResponse.success(labelService.getLabelsByProjectId(projectId));
    }

    // ==========================================
    // ADD LABEL TO PROJECT
    // ==========================================
    @PostMapping("/api/projects/{projectId}/labels")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<LabelResponse> addLabelToProject(
            @PathVariable Long projectId,
            @RequestBody @Valid LabelRequest request,
            Authentication auth) {
            
        return ApiResponse.<LabelResponse>builder()
                .data(labelService.addLabel(projectId, request, getUserId(auth), checkAdmin(auth)))
                .build();
    }

    // ==========================================
    // UPDATE LABEL
    // ==========================================
    @PutMapping("/api/labels/{labelId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<LabelResponse> updateLabel(
            @PathVariable Long labelId,
            @RequestBody @Valid LabelRequest request,
            Authentication auth) {
            
        return ApiResponse.<LabelResponse>builder()
                .data(labelService.updateLabel(labelId, request, getUserId(auth), checkAdmin(auth)))
                .build();
    }

    // ==========================================
    // DELETE LABEL
    // ==========================================
    @DeleteMapping("/api/labels/{labelId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<String> deleteLabel(
            @PathVariable Long labelId,
            Authentication auth) {
            
        labelService.deleteLabel(labelId, getUserId(auth), checkAdmin(auth));
        
        return ApiResponse.<String>builder()
                .data("Đã xóa nhãn thành công!")
                .build();
    }
}