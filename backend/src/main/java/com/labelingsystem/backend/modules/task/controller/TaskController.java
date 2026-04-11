package com.labelingsystem.backend.modules.task.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.response.MyTaskResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskImageResponse;
import com.labelingsystem.backend.modules.task.service.TaskService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
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

    @GetMapping("/tasks/my-tasks")
    @PreAuthorize("hasAuthority('ANNOTATOR')")
    public ApiResponse<List<MyTaskResponse>> getMyTasks(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ApiResponse.success(taskService.getMyTasks(userDetails.getId()));
    }

    @GetMapping("/tasks/{taskId}/images")
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
}
