package com.labelingsystem.backend.modules.project.service.impl;

import com.labelingsystem.backend.modules.project.dto.request.LabelRequest;
import com.labelingsystem.backend.modules.project.dto.response.LabelResponse;
import com.labelingsystem.backend.modules.project.entity.Label;
import com.labelingsystem.backend.modules.project.entity.Project;
import com.labelingsystem.backend.modules.project.repository.LabelRepository;
import com.labelingsystem.backend.modules.project.repository.ProjectRepository;
import com.labelingsystem.backend.modules.project.service.LabelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LabelServiceImpl implements LabelService {

    @Autowired private LabelRepository labelRepository;
    @Autowired private ProjectRepository projectRepository;

    @Override
    @Transactional
    public LabelResponse addLabel(Long projectId, LabelRequest request, Long userId, boolean isAdmin) {
        // 1. Tìm Project / Find Project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy dự án!"));

        // 2. Bảo mật: Kiểm tra quyền sở hữu / Security: Check ownership
        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Lỗi 403: Bạn không có quyền thêm nhãn vào dự án này!");
        }

        // 3. Tạo Label mới / Create new Label
        Label label = new Label();
        label.setName(request.getName());
        label.setColor(request.getColor());
        label.setProject(project);

        Label savedLabel = labelRepository.save(label);
        
        return new LabelResponse(savedLabel.getId(), savedLabel.getName(), savedLabel.getColor(), projectId);
    }

    @Override
    @Transactional
    public LabelResponse updateLabel(Long labelId, LabelRequest request, Long userId, boolean isAdmin) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy nhãn!"));

        // Security: Get the parent Project to check ownership
        Project project = label.getProject();
        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Lỗi 403: Bạn không có quyền sửa nhãn của dự án này!");
        }

        if (request.getName() != null) label.setName(request.getName());
        if (request.getColor() != null) label.setColor(request.getColor());

        Label updatedLabel = labelRepository.save(label);

        return new LabelResponse(updatedLabel.getId(), updatedLabel.getName(), updatedLabel.getColor(), project.getId());
    }

    @Override
    @Transactional
    public void deleteLabel(Long labelId, Long userId, boolean isAdmin) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy nhãn!"));

        Project project = label.getProject();
        if (!isAdmin && !project.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Lỗi 403: Bạn không có quyền xóa nhãn của dự án này!");
        }

        labelRepository.delete(label);
    }
}