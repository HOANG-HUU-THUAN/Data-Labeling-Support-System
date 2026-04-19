package com.labelingsystem.backend.modules.dashboard.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private OverallStatsDTO overall;
    private List<UserPerformanceDTO> userPerformances;
}
