package com.labelingsystem.backend.modules.project.repository;

import com.labelingsystem.backend.modules.project.entity.Project;
import org.springframework.data.jpa.domain.Specification;

public class ProjectSpecification {
    public static Specification<Project> hasName(String name) {
        return (root, query, cb) -> name == null || name.isEmpty() ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Project> hasType(String type) {
        return (root, query, cb) -> type == null || type.isEmpty() ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<Project> hasCreatedBy(Long managerId) {
        return (root, query, cb) -> managerId == null ? null : cb.equal(root.get("createdBy").get("id"), managerId);
    }
}
