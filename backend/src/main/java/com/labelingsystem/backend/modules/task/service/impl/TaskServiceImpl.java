package com.labelingsystem.backend.modules.task.service.impl;

import com.labelingsystem.backend.common.exception.ResourceNotFoundException;
import com.labelingsystem.backend.common.exception.CustomAppException;
import com.labelingsystem.backend.common.enums.ErrorCode;
import com.labelingsystem.backend.modules.dataset.entity.Dataset;
import com.labelingsystem.backend.modules.dataset.entity.Image;
import com.labelingsystem.backend.modules.dataset.repository.DatasetRepository;
import com.labelingsystem.backend.modules.dataset.repository.ImageRepository;
import com.labelingsystem.backend.modules.project.entity.Project;
import com.labelingsystem.backend.modules.project.repository.ProjectRepository;
import com.labelingsystem.backend.modules.task.dto.request.TaskBatchCreateRequest;
import com.labelingsystem.backend.modules.task.dto.response.TaskResponse;
import com.labelingsystem.backend.modules.task.entity.Task;
import com.labelingsystem.backend.common.enums.TaskStatus;
import com.labelingsystem.backend.modules.task.repository.TaskRepository;
import com.labelingsystem.backend.modules.task.service.TaskService;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskServiceImpl implements TaskService {
    
    TaskRepository taskRepository;
    ImageRepository imageRepository;
    DatasetRepository datasetRepository;
    ProjectRepository projectRepository;
    UserRepository userRepository;

    @Override
    @Transactional
    public String createBatchTasks(Long projectId, TaskBatchCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id " + projectId));

        Dataset dataset = datasetRepository.findByIdAndDeletedFalse(request.getDatasetId())
                .orElseThrow(() -> new ResourceNotFoundException("Dataset not found with id " + request.getDatasetId()));

        if (!dataset.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Dataset does not belong to the project");
        }

        List<Image> unassignedImages = imageRepository.findUnassignedImages(projectId, dataset.getId(), "PENDING");
        
        if (unassignedImages.isEmpty()) {
            return "No pending images found to create tasks";
        }

        List<User> annotators = userRepository.findAllById(request.getAnnotatorIds());
        if (annotators.isEmpty()) {
            throw new IllegalArgumentException("No valid annotators found");
        }

        List<User> reviewers = null;
        if (request.getReviewerIds() != null && !request.getReviewerIds().isEmpty()) {
            reviewers = userRepository.findAllById(request.getReviewerIds());
        }

        int imagesPerTask = request.getImagesPerTask();
        int taskCount = 0;

        for (int i = 0; i < unassignedImages.size(); i += imagesPerTask) {
            int end = Math.min(i + imagesPerTask, unassignedImages.size());
            List<Image> batchImages = unassignedImages.subList(i, end);

            // Round-robin assignment for Annotators
            User assignedAnnotator = annotators.get(taskCount % annotators.size());
            
            // Round-robin assignment for Reviewers
            User assignedReviewer = null;
            if (reviewers != null && !reviewers.isEmpty()) {
                assignedReviewer = reviewers.get(taskCount % reviewers.size());
            }

            Task task = Task.builder()
                    .project(project)
                    .assignedAnnotator(assignedAnnotator)
                    .assignedReviewer(assignedReviewer)
                    .status(TaskStatus.PENDING)
                    .deleted(false)
                    .images(new HashSet<>(batchImages))
                    .build();

            taskRepository.save(task);
            taskCount++;
        }

        return "Successfully created " + taskCount + " tasks and assigned images.";
    }

    private TaskResponse mapToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        if (task.getProject() != null) {
            response.setProjectId(task.getProject().getId());
            response.setProjectName(task.getProject().getName());
        }
        if (task.getAssignedAnnotator() != null) {
            response.setAnnotatorId(task.getAssignedAnnotator().getId());
            response.setAnnotatorUsername(task.getAssignedAnnotator().getUsername());
        }
        if (task.getAssignedReviewer() != null) {
            response.setReviewerId(task.getAssignedReviewer().getId());
            response.setReviewerUsername(task.getAssignedReviewer().getUsername());
        }
        response.setStatus(task.getStatus());
        response.setCreatedAt(task.getCreatedAt());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasksBasedOnRole(Long userId, List<String> userRoles) {
        
        List<Task> tasks;

        // 1. Logic phân nhánh theo Quyền (Role-based Branching Logic)
        if (userRoles.contains("ADMIN")) {
            // Xem TẤT CẢ / See ALL
            tasks = taskRepository.findAll();
            
        } else if (userRoles.contains("MANAGER")) {
            // Xem task của DỰ ÁN MÌNH TẠO / See tasks from OWN PROJECTS
            tasks = taskRepository.findByProject_CreatedBy_Id(userId);
            
        } else {
            // ANNOTATOR HOẶC REVIEWER: Xem task MÌNH ĐƯỢC PHÂN CÔNG / See ASSIGNED tasks
            tasks = taskRepository.findByAssignedAnnotator_IdOrAssignedReviewer_Id(userId, userId);
        }

        // 2. Map (Biến đổi) Entity sang DTO / Map Entity to DTO
        return tasks.stream()
        .map(this::mapToResponse)
        .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId, Long userId, List<String> userRoles) {
        // Tìm Task, đảm bảo nó chưa bị xóa mềm (deleted = false)
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.isDeleted()) 
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Task hoặc Task đã bị xóa!"));

        boolean isAdmin = userRoles.contains("ADMIN") || userRoles.contains("ROLE_ADMIN");
        boolean isManager = userRoles.contains("MANAGER") || userRoles.contains("ROLE_MANAGER");

        // KIỂM TRA QUYỀN (RBAC Check)
        if (!isAdmin) {
            if (isManager) {
                // Nếu là Manager, phải là chủ dự án / If Manager, must be project owner
                if (!task.getProject().getCreatedBy().getId().equals(userId)) {
                    throw new RuntimeException("Lỗi 403: Bạn không có quyền xem Task của dự án khác!");
                }
            } else {
                // Nếu là Worker, ID của họ phải nằm ở cột annotator hoặc reviewer
                // If Worker, their ID must be in annotator or reviewer column
                boolean isMyTask = (task.getAssignedAnnotator() != null && task.getAssignedAnnotator().getId().equals(userId)) ||
                                   (task.getAssignedReviewer() != null && task.getAssignedReviewer().getId().equals(userId));
                if (!isMyTask) {
                    throw new RuntimeException("Lỗi 403: Bạn không có quyền xem Task này vì bạn không được phân công!");
                }
            }
        }
        return mapToResponse(task);
    }
}
