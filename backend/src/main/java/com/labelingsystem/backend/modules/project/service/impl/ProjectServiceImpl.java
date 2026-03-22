package com.labelingsystem.backend.modules.project.service.impl;

import com.labelingsystem.backend.modules.project.dto.request.ProjectCreateRequest;
import com.labelingsystem.backend.modules.project.dto.request.ProjectUpdateRequest;
import com.labelingsystem.backend.modules.project.dto.response.ProjectResponse;
import com.labelingsystem.backend.modules.project.entity.Label;
import com.labelingsystem.backend.modules.project.entity.Project;
import com.labelingsystem.backend.modules.project.repository.ProjectRepository;
import com.labelingsystem.backend.modules.project.service.ProjectService;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectServiceImpl implements ProjectService {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserRepository userRepository;

    @Override
    @Transactional
    public Project createProject(ProjectCreateRequest request, String managerEmail) {
        
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Error: Manager not found."));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCreatedBy(manager);

        if (request.getLabels() != null && !request.getLabels().isEmpty()) {
            for (ProjectCreateRequest.LabelRequest labelReq : request.getLabels()) {
                Label label = new Label();
                label.setName(labelReq.getName());
                label.setColor(labelReq.getColor());
                label.setProject(project);
                
                project.getLabels().add(label);
            }
        }

        return projectRepository.save(project);
    }


    @Override
    public List<ProjectResponse> getProjectsByManagerId(Long managerId) {
        List<Project> projects = projectRepository.findByCreatedById(managerId);

        // Use Java Stream to transform (Map) each Project into ProjectResponse
        return projects.stream().map(project -> {
            ProjectResponse response = new ProjectResponse();
            response.setId(project.getId());
            response.setName(project.getName());
            response.setDescription(project.getDescription());
            response.setStatus(project.getStatus());
            response.setCreatedAt(project.getCreatedAt());

        // Transform list of Label Entities into LabelResponse DTOs
            List<ProjectResponse.LabelResponse> labelResponses = project.getLabels().stream().map(label -> {
                ProjectResponse.LabelResponse labelDto = new ProjectResponse.LabelResponse();
                labelDto.setId(label.getId());
                labelDto.setName(label.getName());
                labelDto.setColor(label.getColor());
                return labelDto;
            }).toList();

            response.setLabels(labelResponses);
            return response;
        }).toList();
    }

    // ==========================================
    // UPDATE PROJECT
    // ==========================================
    @Override
    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectUpdateRequest request, Long userId, boolean isAdmin) {
        
        // Find project in DB
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy dự án! (Project not found)"));

        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Lỗi 403: Bạn không có quyền sửa dự án của người khác! (Forbidden)");
        }

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());

        // Update Labels (Full overwrite)
        if (request.getLabels() != null) {
            // Clear old list (Hibernate auto-deletes in DB due to orphanRemoval=true)
            project.getLabels().clear(); 

            // Load new list
            for (ProjectUpdateRequest.LabelUpdateRequest labelReq : request.getLabels()) {
                Label newLabel = new Label();
                newLabel.setName(labelReq.getName());
                newLabel.setColor(labelReq.getColor());
                newLabel.setProject(project);
                project.getLabels().add(newLabel);
            }
        }

        Project updatedProject = projectRepository.save(project);

        ProjectResponse response = new ProjectResponse();
        response.setId(updatedProject.getId());
        response.setName(updatedProject.getName());
        response.setDescription(updatedProject.getDescription());
        response.setStatus(updatedProject.getStatus());
        // ... (Map thêm Label tương tự phần GET nhé)
        
        return response;
    }

    // ==========================================
    // DELETE PROJECT
    // ==========================================
    @Override
    @Transactional
    public void deleteProject(Long projectId, Long userId, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy dự án! (Project not found)"));

        // Same ownership check as Update
        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Lỗi 403: Bạn không có quyền xóa dự án của người khác! (Forbidden)");
        }

        // Delete project (Child labels are auto-deleted)
        projectRepository.delete(project);
    }
}