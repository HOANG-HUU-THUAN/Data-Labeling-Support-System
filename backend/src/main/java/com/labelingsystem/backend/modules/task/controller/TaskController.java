package com.labelingsystem.backend.modules.task.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.response.TaskResponse;
import com.labelingsystem.backend.modules.task.service.TaskService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskController {

    TaskService taskService;

    @PostMapping("/{projectId}/tasks/batch")
    //@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ApiResponse<String> createBatchTasks(
            @PathVariable Long projectId,
            @RequestBody @Valid TaskBatchCreateRequest request) {
        
        String result = taskService.createBatchTasks(projectId, request);
        return ApiResponse.success(result);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER') or hasAuthority('ANNOTATOR') or hasAuthority('REVIEWER')")
    public ResponseEntity<?> getAllTasks(Authentication auth) {
        try {
            // 1. Rút trích ID người dùng / Extract User ID
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            Long userId = userDetails.getId();

            // 2. Rút trích danh sách Quyền của người dùng dưới dạng List<String>
            // Extract the user's Roles as a List<String>
            List<String> userRoles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            // 3. Gọi Service / Call Service
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
