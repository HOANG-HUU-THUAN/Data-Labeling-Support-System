package com.labelingsystem.backend.modules.task.service;

import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.response.MyTaskResponse;
import com.labelingsystem.backend.modules.task.dto.response.TaskImageResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface TaskService {
    String createBatchTasks(Long projectId, TaskBatchCreateRequest request);
    List<MyTaskResponse> getMyTasks(Long annotatorId);
    List<TaskImageResponse> getTaskImages(Long taskId, Long userId, boolean isAdmin, boolean isReviewer, HttpServletRequest request);
}
