package com.labelingsystem.backend.modules.dashboard.service.impl;

import com.labelingsystem.backend.modules.dashboard.dto.response.DashboardResponse;
import com.labelingsystem.backend.modules.dashboard.dto.response.OverallStatsDTO;
import com.labelingsystem.backend.modules.dashboard.dto.response.UserPerformanceDTO;
import com.labelingsystem.backend.modules.dashboard.service.DashboardService;
import com.labelingsystem.backend.modules.task.repository.TaskRepository;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardServiceImpl implements DashboardService {

    TaskRepository taskRepository;
    UserRepository userRepository;

    @Override
    public DashboardResponse getDashboardStats() {
        OverallStatsDTO overall = OverallStatsDTO.builder()
                .totalTasks(taskRepository.countByDeletedFalse())
                .assignedTasks(taskRepository.countByAssignedAnnotatorIsNotNullAndDeletedFalse())
                .pendingApproval(taskRepository.countByStatusAndDeletedFalse("IN_REVIEW"))
                .rejectedTasks(taskRepository.countByStatusAndDeletedFalse("REJECTED"))
                .approvedTasks(taskRepository.countByStatusAndDeletedFalse("APPROVED"))
                .build();

        List<User> annotators = userRepository.findByRoles_Name("ANNOTATOR");
        List<User> reviewers = userRepository.findByRoles_Name("REVIEWER");

        List<UserPerformanceDTO> userPerformances = new ArrayList<>();

        for (User user : annotators) {
            userPerformances.add(UserPerformanceDTO.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .role("ANNOTATOR")
                    .assignedTasks(taskRepository.countByAssignedAnnotatorIdAndDeletedFalse(user.getId()))
                    .completedTasks(taskRepository.countByAssignedAnnotatorIdAndStatusAndDeletedFalse(user.getId(), "APPROVED"))
                    .pendingTasks(taskRepository.countByAssignedAnnotatorIdAndStatusAndDeletedFalse(user.getId(), "IN_REVIEW"))
                    .rejectedTasks(taskRepository.countByAssignedAnnotatorIdAndStatusAndDeletedFalse(user.getId(), "REJECTED"))
                    .build());
        }

        for (User user : reviewers) {
            userPerformances.add(UserPerformanceDTO.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .role("REVIEWER")
                    .assignedTasks(taskRepository.countByAssignedReviewerIdAndDeletedFalse(user.getId()))
                    .completedTasks(taskRepository.countByAssignedReviewerIdAndStatusAndDeletedFalse(user.getId(), "APPROVED"))
                    .pendingTasks(taskRepository.countByAssignedReviewerIdAndStatusAndDeletedFalse(user.getId(), "IN_REVIEW"))
                    .rejectedTasks(taskRepository.countByAssignedReviewerIdAndStatusAndDeletedFalse(user.getId(), "REJECTED"))
                    .build());
        }

        return DashboardResponse.builder()
                .overall(overall)
                .userPerformances(userPerformances)
                .build();
    }
}
