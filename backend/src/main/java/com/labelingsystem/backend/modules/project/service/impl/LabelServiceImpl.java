package com.labelingsystem.backend.modules.project.service.impl;

import com.labelingsystem.backend.common.enums.ErrorCode;
import com.labelingsystem.backend.common.exception.CustomAppException;
import com.labelingsystem.backend.modules.project.dto.request.LabelRequest;
import com.labelingsystem.backend.modules.project.dto.response.LabelResponse;
import com.labelingsystem.backend.modules.project.entity.Label;
import com.labelingsystem.backend.modules.project.entity.Project;
import com.labelingsystem.backend.modules.project.mapper.ProjectMapper;
import com.labelingsystem.backend.modules.project.repository.LabelRepository;
import com.labelingsystem.backend.modules.project.repository.ProjectRepository;
import com.labelingsystem.backend.modules.project.service.LabelService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LabelServiceImpl implements LabelService {

    LabelRepository labelRepository;
    ProjectRepository projectRepository;
    ProjectMapper projectMapper;

    @Override
    @Transactional
    public LabelResponse addLabel(Long projectId, LabelRequest request, Long userId, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomAppException(ErrorCode.PROJECT_NOT_FOUND));

        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
            throw new CustomAppException(ErrorCode.FORBIDDEN_PROJECT_ACCESS);
        }

        Label label = new Label();
        label.setName(request.getName());
        label.setColor(request.getColor());
        label.setProject(project);

        Label savedLabel = labelRepository.save(label);
        
        return projectMapper.toLabelResponse(savedLabel);
    }

    @Override
    @Transactional
    public LabelResponse updateLabel(Long labelId, LabelRequest request, Long userId, boolean isAdmin) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new CustomAppException(ErrorCode.LABEL_NOT_FOUND));

        Project project = label.getProject();
        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
            throw new CustomAppException(ErrorCode.FORBIDDEN_PROJECT_ACCESS);
        }

        if (request.getName() != null) label.setName(request.getName());
        if (request.getColor() != null) label.setColor(request.getColor());

        Label updatedLabel = labelRepository.save(label);

        return projectMapper.toLabelResponse(updatedLabel);
    }

    @Override
    @Transactional
    public void deleteLabel(Long labelId, Long userId, boolean isAdmin) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new CustomAppException(ErrorCode.LABEL_NOT_FOUND));

        Project project = label.getProject();
        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
             throw new CustomAppException(ErrorCode.FORBIDDEN_PROJECT_ACCESS);
        }

        labelRepository.delete(label);
    }
}