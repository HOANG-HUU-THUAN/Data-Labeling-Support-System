package com.labelingsystem.backend.modules.dashboard.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OverallStatsDTO {
    private long totalTasks;
    private long assignedTasks;
    private long pendingApproval;
    private long rejectedTasks;
    private long approvedTasks;
}
