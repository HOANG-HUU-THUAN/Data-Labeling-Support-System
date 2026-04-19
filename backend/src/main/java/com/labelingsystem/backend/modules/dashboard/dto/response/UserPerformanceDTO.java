package com.labelingsystem.backend.modules.dashboard.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPerformanceDTO {
    private Long userId;
    private String username;
    private String role;
    private long assignedTasks;
    private long completedTasks;
    private long pendingTasks;
    private long rejectedTasks;
}
