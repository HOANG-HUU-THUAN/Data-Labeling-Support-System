package com.labelingsystem.backend.modules.task.repository;

import com.labelingsystem.backend.modules.task.entity.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    @EntityGraph(attributePaths = {"project", "assignedAnnotator", "assignedReviewer", "images"})
    List<Task> findByAssignedAnnotatorIdAndDeletedFalseAndStatusInOrderByCreatedAtDesc(Long annotatorId, List<String> statuses);

    @EntityGraph(attributePaths = {"project", "assignedAnnotator", "assignedReviewer", "images", "images.dataset"})
    Optional<Task> findByIdAndDeletedFalse(Long id);
}
