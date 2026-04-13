package com.labelingsystem.backend.modules.task.service;

import java.util.List;
import com.labelingsystem.backend.modules.task.dto.response.TaskResponse;

import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.response.TaskImageResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface TaskService {
    String createBatchTasks(Long projectId, TaskBatchCreateRequest request);

    List<TaskImageResponse> getTaskImages(Long taskId, Long userId, boolean isAdmin, boolean isReviewer, HttpServletRequest request);

    TaskResponse getTaskById(Long taskId, Long userId, List<String> userRoles);

    List<TaskResponse> getAllTasksBasedOnRole(Long userId, List<String> userRoles);
}
