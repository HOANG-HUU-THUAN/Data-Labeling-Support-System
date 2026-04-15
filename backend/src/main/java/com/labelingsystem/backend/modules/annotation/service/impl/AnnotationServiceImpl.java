package com.labelingsystem.backend.modules.annotation.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.labelingsystem.backend.common.exception.ResourceNotFoundException;
import com.labelingsystem.backend.modules.annotation.dto.AnnotationRequest;
import com.labelingsystem.backend.modules.annotation.dto.AnnotationResponse;
import com.labelingsystem.backend.modules.annotation.entity.Annotation;
import com.labelingsystem.backend.modules.annotation.repository.AnnotationRepository;
import com.labelingsystem.backend.modules.annotation.service.AnnotationService;
import com.labelingsystem.backend.modules.dataset.entity.Image;
import com.labelingsystem.backend.modules.dataset.repository.ImageRepository;
import com.labelingsystem.backend.modules.project.entity.Label;
import com.labelingsystem.backend.modules.project.repository.LabelRepository;
import com.labelingsystem.backend.modules.task.entity.Task;
import com.labelingsystem.backend.modules.task.repository.TaskRepository;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnotationServiceImpl implements AnnotationService {

    private final AnnotationRepository annotationRepository;
    private final ImageRepository imageRepository;
    private final TaskRepository taskRepository;
    private final LabelRepository labelRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<AnnotationResponse> getAnnotationsByImage(Long imageId) {
        return annotationRepository.findByImageIdAndDeletedFalse(imageId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AnnotationResponse createAnnotation(AnnotationRequest request) {
        Image image = imageRepository.findById(request.getImageId())
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));
        
        Long taskId = request.getTaskId();
        if (taskId == null) {
            List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> t.getImages().contains(image) && !t.isDeleted())
                .collect(Collectors.toList());
            if (tasks.isEmpty()) {
                throw new ResourceNotFoundException("No task found for this image");
            }
            taskId = tasks.get(0).getId();
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        Label label = labelRepository.findById(request.getLabelId())
                .orElseThrow(() -> new ResourceNotFoundException("Label not found"));
        
        User currentUser = getCurrentUser();

        Annotation annotation = Annotation.builder()
                .image(image)
                .task(task)
                .label(label)
                .type(request.getType() != null ? request.getType() : "BOX")
                .coordinates(mapCoordinatesToJson(request))
                .createdBy(currentUser)
                .deleted(false)
                .build();

        return mapToResponse(annotationRepository.save(annotation));
    }

    @Override
    @Transactional
    public AnnotationResponse updateAnnotation(Long id, AnnotationRequest request) {
        Annotation annotation = annotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Annotation not found"));

        if (request.getLabelId() != null) {
            Label label = labelRepository.findById(request.getLabelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Label not found"));
            annotation.setLabel(label);
        }

        annotation.setCoordinates(updateCoordinatesJson(annotation.getCoordinates(), request));
        if (request.getType() != null) {
            annotation.setType(request.getType());
        }

        return mapToResponse(annotationRepository.save(annotation));
    }

    @Override
    @Transactional
    public void deleteAnnotation(Long id) {
        Annotation annotation = annotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Annotation not found"));
        annotation.setDeleted(true);
        annotationRepository.save(annotation);
    }

    @Override
    @Transactional
    public void replaceAnnotationsForImage(Long imageId, List<AnnotationRequest> replacements) {
        List<Annotation> existing = annotationRepository.findByImageIdAndDeletedFalse(imageId);
        existing.forEach(a -> a.setDeleted(true));
        annotationRepository.saveAll(existing);

        for (AnnotationRequest request : replacements) {
            request.setImageId(imageId);
            createAnnotation(request);
        }
    }

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private JsonNode mapCoordinatesToJson(AnnotationRequest request) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("x", request.getX());
        node.put("y", request.getY());
        node.put("w", request.getW());
        node.put("h", request.getH());
        return node;
    }

    private JsonNode updateCoordinatesJson(JsonNode existing, AnnotationRequest request) {
        ObjectNode node = (ObjectNode) existing;
        if (request.getX() != null) node.put("x", request.getX());
        if (request.getY() != null) node.put("y", request.getY());
        if (request.getW() != null) node.put("w", request.getW());
        if (request.getH() != null) node.put("h", request.getH());
        return node;
    }

    private AnnotationResponse mapToResponse(Annotation annotation) {
        JsonNode coords = annotation.getCoordinates();
        return AnnotationResponse.builder()
                .id(annotation.getId())
                .imageId(annotation.getImage().getId())
                .labelId(annotation.getLabel().getId())
                .x(coords.has("x") ? coords.get("x").asDouble() : 0.0)
                .y(coords.has("y") ? coords.get("y").asDouble() : 0.0)
                .w(coords.has("w") ? coords.get("w").asDouble() : 0.0)
                .h(coords.has("h") ? coords.get("h").asDouble() : 0.0)
                .type(annotation.getType())
                .build();
    }
}
