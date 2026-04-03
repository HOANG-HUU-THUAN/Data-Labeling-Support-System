package com.labelingsystem.backend.modules.project.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.project.dto.request.ProjectCreateRequest;
import com.labelingsystem.backend.modules.project.dto.request.ProjectUpdateRequest;
import com.labelingsystem.backend.modules.project.dto.response.ProjectResponse;
import com.labelingsystem.backend.modules.project.service.ProjectService;
import com.labelingsystem.backend.security.service.UserDetailsImpl; 

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProjectController {

    ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<ProjectResponse> createProject(@RequestBody @Valid ProjectCreateRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String managerEmail = userDetails.getEmail(); 

        return ApiResponse.<ProjectResponse>builder()
                .data(projectService.createProject(request, managerEmail))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<List<ProjectResponse>> getMyProjects(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long managerId = userDetails.getId();

        return ApiResponse.<List<ProjectResponse>>builder()
                .data(projectService.getProjectsByManagerId(managerId))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<ProjectResponse> updateProject(
            @PathVariable("id") Long projectId,
            @RequestBody @Valid ProjectUpdateRequest request, 
            Authentication authentication) {
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));

        return ApiResponse.<ProjectResponse>builder()
                .data(projectService.updateProject(projectId, request, userId, isAdmin))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER') or hasAuthority('ANNOTATOR') or hasAuthority('REVIEWER')")
    public ApiResponse<ProjectResponse> getProjectById(
            @PathVariable("id") Long projectId,
            Authentication authentication) {
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));

        return ApiResponse.<ProjectResponse>builder()
                .data(projectService.getProjectById(projectId, userId, isAdmin))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<String> deleteProject(
            @PathVariable("id") Long projectId, 
            Authentication authentication) {
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));

        projectService.deleteProject(projectId, userId, isAdmin);
        
        return ApiResponse.<String>builder()
                .data("Xóa dự án thành công!")
                .build();
    }
}