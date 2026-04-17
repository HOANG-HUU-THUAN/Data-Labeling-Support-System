package com.labelingsystem.backend.modules.project.service;

import com.labelingsystem.backend.modules.project.dto.request.ProjectCreateRequest;
import com.labelingsystem.backend.modules.project.dto.response.ProjectResponse;
import com.labelingsystem.backend.modules.project.entity.Project;
import com.labelingsystem.backend.modules.project.dto.request.ProjectUpdateRequest;
import com.labelingsystem.backend.common.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface ProjectService {
    ProjectResponse createProject(ProjectCreateRequest request, String managerEmail);

    PageResponse<ProjectResponse> getProjectsByManagerId(Long managerId, String name, String type, Pageable pageable);

    ProjectResponse updateProject(Long projectId, ProjectUpdateRequest request, Long userId, boolean isAdmin);

    void deleteProject(Long projectId, Long userId, boolean isAdmin);

    ProjectResponse getProjectById(Long projectId, Long userId, boolean isAdmin);
}