package com.labelingsystem.backend.modules.dashboard.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.dashboard.dto.response.DashboardResponse;
import com.labelingsystem.backend.modules.dashboard.service.DashboardService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardController {

    DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ApiResponse<DashboardResponse> getDashboardStats() {
        return ApiResponse.<DashboardResponse>builder()
                .data(dashboardService.getDashboardStats())
                .build();
    }
}
