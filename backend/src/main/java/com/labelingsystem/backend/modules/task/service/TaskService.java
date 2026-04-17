package com.labelingsystem.backend.modules.task.service;

import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.request.TaskUpdateRequest;
import com.labelingsystem.backend.modules.task.dto.response.MyTaskResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskImageResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskSubmitResponse;
import com.labelingsystem.backend.common.response.PageResponse;
import org.springframework.data.domain.Pageable;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface TaskService {
    String createBatchTasks(Long projectId, TaskBatchCreateRequest request);
    PageResponse<MyTaskResponse> getMyTasks(Long annotatorId, String projectName, String status, Pageable pageable);
    PageResponse<MyTaskResponse> getTasksForReview(Long reviewerId, String projectName, String status, Pageable pageable);
    List<TaskImageResponse> getTaskImages(Long taskId, Long userId, boolean isAdmin, boolean isReviewer, HttpServletRequest request);
    TaskSubmitResponse submitTask(Long taskId, Long userId, boolean isAdmin);
    
    // New methods
    PageResponse<TaskResponse> getAllTasks(String status, Pageable pageable);
    TaskResponse getTaskById(Long id);
    TaskResponse updateTask(Long id, TaskUpdateRequest request);
    TaskResponse assignTask(Long id, Long assigneeId);
    TaskResponse updateTaskStatus(Long id, String status);
    void deleteTask(Long id);
}
