package com.labelingsystem.backend.modules.task.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects")
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
}
