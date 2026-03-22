package com.labelingsystem.backend.modules.project.controller;

import com.labelingsystem.backend.modules.project.dto.request.ProjectCreateRequest;
import com.labelingsystem.backend.modules.project.entity.Project;
import com.labelingsystem.backend.modules.project.service.ProjectService;
import com.labelingsystem.backend.security.service.UserDetailsImpl; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.labelingsystem.backend.modules.project.dto.response.ProjectResponse;
import com.labelingsystem.backend.modules.project.dto.request.ProjectUpdateRequest;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<?> createProject(@RequestBody ProjectCreateRequest request, Authentication authentication) {
        
        // Cast to get the exact UserDetailsImpl object
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        String managerEmail = userDetails.getEmail(); 

        try {
            Project newProject = projectService.createProject(request, managerEmail);
            return ResponseEntity.ok("Dự án được tạo thành công với ID: " + newProject.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo dự án: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<?> getMyProjects(Authentication authentication) {
        
        // Get the currently logged-in user's details from the Token
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long managerId = userDetails.getId();

        try {
            // Call Service to get data
            List<ProjectResponse> myProjects = projectService.getProjectsByManagerId(managerId);

            return ResponseEntity.ok(myProjects);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy danh sách: " + e.getMessage());
        }
    }

    // ==========================================
    // API SỬA DỰ ÁN (UPDATE)
    // ==========================================
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<?> updateProject(
            @PathVariable("id") Long projectId,
            @RequestBody ProjectUpdateRequest request, 
            Authentication authentication) {
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().contains("ADMIN"));

            projectService.updateProject(projectId, request, userId, isAdmin);
            return ResponseEntity.ok("Cập nhật dự án thành công! (Project updated successfully!)");
            
        } catch (RuntimeException e) {
            if(e.getMessage().contains("403")) {
                return ResponseEntity.status(403).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // API XÓA DỰ ÁN (DELETE)
    // ==========================================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<?> deleteProject(
            @PathVariable("id") Long projectId, 
            Authentication authentication) {
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().contains("ADMIN"));

            projectService.deleteProject(projectId, userId, isAdmin);
            return ResponseEntity.ok("Xóa dự án thành công! (Project deleted successfully!)");
            
        } catch (RuntimeException e) {
            if(e.getMessage().contains("403")) {
                return ResponseEntity.status(403).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}