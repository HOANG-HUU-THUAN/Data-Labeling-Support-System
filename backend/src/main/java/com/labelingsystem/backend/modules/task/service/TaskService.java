package com.labelingsystem.backend.modules.task.service;

import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;

public interface TaskService {
    String createBatchTasks(Long projectId, TaskBatchCreateRequest request);
}
