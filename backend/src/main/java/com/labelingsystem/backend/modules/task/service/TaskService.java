package com.labelingsystem.backend.modules.task.service;

import java.util.List;

import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.response.TaskResponse;

public interface TaskService {
    String createBatchTasks(Long projectId, TaskBatchCreateRequest request);

    // 1. Lấy chi tiết 1 Task theo ID / Get details of 1 Task by ID
    TaskResponse getTaskById(Long taskId, Long userId, List<String> userRoles);

    List<TaskResponse> getAllTasksBasedOnRole(Long userId, List<String> userRoles);

}
