package com.labelingsystem.backend.modules.task.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.request.TaskUpdateRequest;
import com.labelingsystem.backend.modules.task.dto.request.TaskAssignRequest;
import com.labelingsystem.backend.modules.task.dto.request.TaskStatusRequest;
import com.labelingsystem.backend.modules.task.dto.response.MyTaskResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskImageResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskSubmitResponse;
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
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskController {

    TaskService taskService;

    @GetMapping("/tasks")
    @PreAuthorize("hasAuthority('MANAGER') or hasAuthority('ADMIN')")
    public ApiResponse<List<TaskResponse>> getAllTasks() {
        return ApiResponse.success(taskService.getAllTasks());
    }

    @GetMapping("/tasks/{taskId}")
    @PreAuthorize("hasAuthority('ANNOTATOR') or hasAuthority('REVIEWER') or hasAuthority('MANAGER') or hasAuthority('ADMIN')")
    public ApiResponse<TaskResponse> getTaskById(@PathVariable Long taskId) {
        return ApiResponse.success(taskService.getTaskById(taskId));
    }

    @PutMapping("/tasks/{taskId}")
    @PreAuthorize("hasAuthority('MANAGER') or hasAuthority('ADMIN')")
    public ApiResponse<TaskResponse> updateTask(@PathVariable Long taskId, @RequestBody @Valid TaskUpdateRequest request) {
        return ApiResponse.success(taskService.updateTask(taskId, request));
    }

    @PatchMapping("/tasks/{taskId}/assignee")
    @PreAuthorize("hasAuthority('MANAGER') or hasAuthority('ADMIN')")
    public ApiResponse<TaskResponse> assignTask(@PathVariable Long taskId, @RequestBody TaskAssignRequest request) {
        return ApiResponse.success(taskService.assignTask(taskId, request.getAssigneeId()));
    }

    @PatchMapping("/tasks/{taskId}/status")
    public ApiResponse<TaskResponse> updateTaskStatus(@PathVariable Long taskId, @RequestBody TaskStatusRequest request) {
        return ApiResponse.success(taskService.updateTaskStatus(taskId, request.getStatus()));
    }

    @DeleteMapping("/tasks/{taskId}")
    @PreAuthorize("hasAuthority('MANAGER') or hasAuthority('ADMIN')")
    public ApiResponse<String> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ApiResponse.success("Task deleted successfully");
    }

    @PostMapping("/tasks/{taskId}/submit")
    @PreAuthorize("hasAuthority('ANNOTATOR') or hasAuthority('ADMIN')")
    public ApiResponse<TaskSubmitResponse> submitTask(@PathVariable Long taskId, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));
        return ApiResponse.success(taskService.submitTask(taskId, userDetails.getId(), isAdmin));
    }

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

    @GetMapping("/tasks/review")
    @PreAuthorize("hasAuthority('REVIEWER') or hasAuthority('MANAGER') or hasAuthority('ADMIN')")
    public ApiResponse<List<MyTaskResponse>> getTasksForReview(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ApiResponse.success(taskService.getTasksForReview(userDetails.getId()));
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
