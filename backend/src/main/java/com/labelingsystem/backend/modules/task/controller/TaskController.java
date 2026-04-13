package com.labelingsystem.backend.modules.task.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.response.TaskImageResponse;
import com.labelingsystem.backend.modules.task.service.TaskService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import com.labelingsystem.backend.modules.task.dto.response.TaskResponse;
import com.labelingsystem.backend.modules.task.service.TaskService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.GrantedAuthority;


@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskController {

    TaskService taskService;

    @PostMapping("/projects/{projectId}/tasks/batch")
    @PreAuthorize("hasAuthority('MANAGER') or hasAuthority('ADMIN')")
    public ApiResponse<String> createBatchTasks(
            @PathVariable Long projectId,
            @RequestBody @Valid TaskBatchCreateRequest request) {

        String result = taskService.createBatchTasks(projectId, request);
        return ApiResponse.success(result);
    }

    @GetMapping("/{taskId}/images")
    @PreAuthorize("hasAuthority('ANNOTATOR') or hasAuthority('REVIEWER') or hasAuthority('ADMIN')")
    public ApiResponse<List<TaskImageResponse>> getTaskImages(
            @PathVariable Long taskId,
            Authentication authentication,
            HttpServletRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().contains("ADMIN"));
        boolean isReviewer = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().contains("REVIEWER"));

        return ApiResponse.success(
                taskService.getTaskImages(taskId, userDetails.getId(), isAdmin, isReviewer, request)
        );
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER') or hasAuthority('ANNOTATOR') or hasAuthority('REVIEWER')")
    public ResponseEntity<?> getAllTasks(Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            Long userId = userDetails.getId();

            List<String> userRoles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            List<TaskResponse> tasks = taskService.getAllTasksBasedOnRole(userId, userRoles);
            
            return ResponseEntity.ok(tasks);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy danh sách Task: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER') or hasAuthority('ANNOTATOR') or hasAuthority('REVIEWER')")
    public ResponseEntity<?> getTaskById(@PathVariable("id") Long taskId, Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
            
            TaskResponse task = taskService.getTaskById(taskId, userDetails.getId(), roles);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
