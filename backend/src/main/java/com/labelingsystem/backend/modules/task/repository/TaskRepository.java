package com.labelingsystem.backend.modules.task.repository;

import com.labelingsystem.backend.modules.task.entity.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Dành cho MANAGER: Tìm tasks thuộc các projects do user này tạo ra
    // For MANAGER: Find tasks belonging to projects created by this user
    // (Giả sử trong class Project, cột created_by được map thành thuộc tính: private User createdBy;)
    List<Task> findByProject_CreatedBy_Id(Long managerId);

    // Dành cho ANNOTATOR / REVIEWER: Tìm tasks mà user này được gán làm Annotator HOẶC Reviewer
    // For ANNOTATOR / REVIEWER: Find tasks where this user is assigned as Annotator OR Reviewer
    List<Task> findByAssignedAnnotator_IdOrAssignedReviewer_Id(Long annotatorId, Long reviewerId);
}
