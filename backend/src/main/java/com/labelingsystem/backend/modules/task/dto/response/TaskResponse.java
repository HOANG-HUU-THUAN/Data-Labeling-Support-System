package com.labelingsystem.backend.modules.task.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

import com.labelingsystem.backend.common.enums.TaskStatus;

@Data
public class TaskResponse {
    private Long id;
    
    // Thông tin Dự án / Project Info
    private Long projectId;
    private String projectName; 
    
    // Thông tin người làm nhiệm vụ / Assignee Info
    private Long annotatorId;
    private String annotatorUsername;
    
    private Long reviewerId;
    private String reviewerUsername;
    
    // Trạng thái & Ngày tạo / Status & Created Date
    private TaskStatus status;
    private LocalDateTime createdAt;
}