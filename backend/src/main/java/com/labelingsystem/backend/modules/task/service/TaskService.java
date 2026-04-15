package com.labelingsystem.backend.modules.task.service;

import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.request.TaskUpdateRequest;
import com.labelingsystem.backend.modules.task.dto.response.MyTaskResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskImageResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskSubmitResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface TaskService {
    String createBatchTasks(Long projectId, TaskBatchCreateRequest request);
    List<MyTaskResponse> getMyTasks(Long annotatorId);
    List<MyTaskResponse> getTasksForReview(Long reviewerId);
    List<TaskImageResponse> getTaskImages(Long taskId, Long userId, boolean isAdmin, boolean isReviewer, HttpServletRequest request);
    TaskSubmitResponse submitTask(Long taskId, Long userId, boolean isAdmin);
    
    // New methods
    List<TaskResponse> getAllTasks();
    TaskResponse getTaskById(Long id);
    TaskResponse updateTask(Long id, TaskUpdateRequest request);
    TaskResponse assignTask(Long id, Long assigneeId);
    TaskResponse updateTaskStatus(Long id, String status);
    void deleteTask(Long id);
}
