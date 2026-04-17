package com.labelingsystem.backend.modules.task.repository;

import com.labelingsystem.backend.modules.task.entity.Task;
import org.springframework.data.jpa.domain.Specification;

public class TaskSpecification {
    public static Specification<Task> hasStatus(String status) {
        return (root, query, cb) -> status == null || status.isEmpty() ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Task> hasProjectName(String projectName) {
        return (root, query, cb) -> projectName == null || projectName.isEmpty() ? null : 
            cb.like(cb.lower(root.get("project").get("name")), "%" + projectName.toLowerCase() + "%");
    }

    public static Specification<Task> hasAnnotatorId(Long annotatorId) {
        return (root, query, cb) -> annotatorId == null ? null : cb.equal(root.get("assignedAnnotator").get("id"), annotatorId);
    }

    public static Specification<Task> hasReviewerId(Long reviewerId) {
        return (root, query, cb) -> reviewerId == null ? null : cb.equal(root.get("assignedReviewer").get("id"), reviewerId);
    }
}
