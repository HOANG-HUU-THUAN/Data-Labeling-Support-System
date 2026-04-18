package com.labelingsystem.backend.modules.task.repository;

import com.labelingsystem.backend.modules.task.entity.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    @EntityGraph(attributePaths = {"project", "assignedAnnotator", "assignedReviewer", "images"})
    List<Task> findByAssignedAnnotatorIdAndStatusInOrderByCreatedAtDesc(Long annotatorId, List<String> statuses);

    @EntityGraph(attributePaths = {"project", "assignedAnnotator", "assignedReviewer", "images"})
    List<Task> findByAssignedReviewerIdAndStatusInOrderByCreatedAtDesc(Long reviewerId, List<String> statuses);

    @EntityGraph(attributePaths = {"project", "assignedAnnotator", "assignedReviewer", "images", "images.dataset"})
    List<Task> findByProjectIdAndStatus(Long projectId, String status);

    @EntityGraph(attributePaths = {"project", "assignedAnnotator", "assignedReviewer", "images", "images.dataset"})
    Optional<Task> findById(Long id);
}
