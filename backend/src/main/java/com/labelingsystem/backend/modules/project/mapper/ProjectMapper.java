package com.labelingsystem.backend.modules.project.mapper;

import com.labelingsystem.backend.modules.project.dto.request.ProjectCreateRequest;
import com.labelingsystem.backend.modules.project.dto.request.ProjectUpdateRequest;
import com.labelingsystem.backend.modules.project.dto.response.LabelResponse;
import com.labelingsystem.backend.modules.project.dto.response.ProjectResponse;
import com.labelingsystem.backend.modules.project.entity.Label;
import com.labelingsystem.backend.modules.project.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(target = "labels", ignore = true)
    Project toProject(ProjectCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "labels", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    void updateProjectFromDTO(ProjectUpdateRequest request, @MappingTarget Project project);

    ProjectResponse toProjectResponse(Project project);

    // Dùng riêng mapping cho Label trong controller /LabelController
    @Mapping(source = "project.id", target = "projectId")
    LabelResponse toLabelResponse(Label label);
}
