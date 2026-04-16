package com.labelingsystem.backend.modules.project.service.impl;

import com.labelingsystem.backend.common.enums.ProjectStatus;
import com.labelingsystem.backend.common.enums.ErrorCode;
import com.labelingsystem.backend.common.exception.CustomAppException;
import com.labelingsystem.backend.modules.project.dto.request.ProjectCreateRequest;
import com.labelingsystem.backend.modules.project.dto.request.ProjectUpdateRequest;
import com.labelingsystem.backend.modules.project.dto.response.ProjectResponse;
import com.labelingsystem.backend.modules.project.entity.Label;
import com.labelingsystem.backend.modules.project.entity.Project;
import com.labelingsystem.backend.modules.project.mapper.ProjectMapper;
import com.labelingsystem.backend.modules.project.repository.ProjectRepository;
import com.labelingsystem.backend.modules.project.service.ProjectService;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProjectServiceImpl implements ProjectService {

    ProjectRepository projectRepository;
    UserRepository userRepository;
    ProjectMapper projectMapper;

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request, String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new CustomAppException(ErrorCode.USER_NOT_EXISTED));

        Project project = projectMapper.toProject(request);
        project.setCreatedBy(manager);
        project.setStatus(ProjectStatus.ACTIVE);

        if (request.getLabels() != null && !request.getLabels().isEmpty()) {
            for (ProjectCreateRequest.LabelRequest labelReq : request.getLabels()) {
                Label label = new Label();
                label.setName(labelReq.getName());
                label.setColor(labelReq.getColor());
                label.setProject(project);
                
                project.getLabels().add(label);
            }
        }

        project = projectRepository.save(project);
        return projectMapper.toProjectResponse(project);
    }


    @Override
    public List<ProjectResponse> getProjectsByManagerId(Long managerId) {
        List<Project> projects = projectRepository.findByCreatedById(managerId);

        return projects.stream()
                .map(projectMapper::toProjectResponse)
                .collect(Collectors.toList());
    }

    // ==========================================
    // UPDATE PROJECT
    // ==========================================
    @Override
    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectUpdateRequest request, Long userId, boolean isAdmin) {
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomAppException(ErrorCode.PROJECT_NOT_FOUND));

        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
            throw new CustomAppException(ErrorCode.FORBIDDEN_PROJECT_ACCESS);
        }

        projectMapper.updateProjectFromDTO(request, project);

        // Update Labels (Surgical update to avoid FK violations)
        if (request.getLabels() != null) {
            Map<Long, ProjectUpdateRequest.LabelUpdateRequest> incomingLabels = request.getLabels().stream()
                    .filter(l -> l.getId() != null)
                    .collect(Collectors.toMap(ProjectUpdateRequest.LabelUpdateRequest::getId, l -> l));

            // Mark removed labels as deleted
            Set<Long> incomingIds = incomingLabels.keySet();
            for (Label existingLabel : project.getLabels()) {
                if (!incomingIds.contains(existingLabel.getId())) {
                    existingLabel.setDeleted(true);
                } else {
                    // Update existing
                    ProjectUpdateRequest.LabelUpdateRequest req = incomingLabels.get(existingLabel.getId());
                    existingLabel.setName(req.getName());
                    existingLabel.setColor(req.getColor());
                    existingLabel.setDeleted(false); // Ensure it's not marked deleted if it's in the request
                }
            }

            // Add new labels
            for (ProjectUpdateRequest.LabelUpdateRequest labelReq : request.getLabels()) {
                if (labelReq.getId() == null) {
                    Label newLabel = new Label();
                    newLabel.setName(labelReq.getName());
                    newLabel.setColor(labelReq.getColor());
                    newLabel.setProject(project);
                    project.getLabels().add(newLabel);
                }
            }
        }

        project = projectRepository.save(project);
        return projectMapper.toProjectResponse(project);
    }

    // ==========================================
    // DELETE PROJECT
    // ==========================================
    @Override
    @Transactional
    public void deleteProject(Long projectId, Long userId, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomAppException(ErrorCode.PROJECT_NOT_FOUND));

        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
            throw new CustomAppException(ErrorCode.FORBIDDEN_PROJECT_ACCESS);
        }

        project.setDeleted(true);
        projectRepository.save(project);
    }

    @Override
    public ProjectResponse getProjectById(Long projectId, Long userId, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomAppException(ErrorCode.PROJECT_NOT_FOUND));

        // For now, allow manager, admin, annotator and reviewer access.
        // In a real system, we should check if the user is actually assigned to this project.
        // But since task assignment logic is still simple, we allow all authenticated roles for now.
        
        return projectMapper.toProjectResponse(project);
    }
}