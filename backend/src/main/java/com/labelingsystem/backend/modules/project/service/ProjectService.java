package com.labelingsystem.backend.modules.project.service;

import com.labelingsystem.backend.modules.project.dto.request.ProjectCreateRequest;
import com.labelingsystem.backend.modules.project.dto.response.ProjectResponse;
import com.labelingsystem.backend.modules.project.entity.Project;
import com.labelingsystem.backend.modules.project.dto.request.ProjectUpdateRequest;
import java.util.List;

public interface ProjectService {
    Project createProject(ProjectCreateRequest request, String managerEmail);

    List<ProjectResponse> getProjectsByManagerId(Long managerId);

    ProjectResponse updateProject(Long projectId, ProjectUpdateRequest request, Long userId, boolean isAdmin);

    void deleteProject(Long projectId, Long userId, boolean isAdmin);
}