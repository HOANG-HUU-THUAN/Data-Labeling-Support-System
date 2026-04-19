package com.labelingsystem.backend.modules.dataset.service.impl;

import com.labelingsystem.backend.common.exception.ResourceNotFoundException;
import com.labelingsystem.backend.modules.audit.aspect.AuditAction;
import com.labelingsystem.backend.modules.dataset.entity.Dataset;
import com.labelingsystem.backend.modules.dataset.entity.Image;
import com.labelingsystem.backend.modules.dataset.repository.DatasetRepository;
import com.labelingsystem.backend.modules.dataset.repository.ImageRepository;
import com.labelingsystem.backend.modules.dataset.service.DatasetService;
import com.labelingsystem.backend.modules.dataset.storage.StorageService;
import com.labelingsystem.backend.modules.project.entity.Project;
import com.labelingsystem.backend.modules.project.repository.ProjectRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.labelingsystem.backend.common.exception.StorageLimitExceededException;
import com.labelingsystem.backend.modules.systemconfig.service.SystemConfigService;

import java.util.ArrayList;
import java.util.List;

import com.labelingsystem.backend.modules.dataset.dto.response.DatasetResponse;
import com.labelingsystem.backend.modules.dataset.dto.response.ImageResponse;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DatasetServiceImpl implements DatasetService {

    ProjectRepository projectRepository;
    DatasetRepository datasetRepository;
    ImageRepository imageRepository;
    StorageService storageService;
    SystemConfigService systemConfigService;

    @Override
    @Transactional(readOnly = true)
    public List<DatasetResponse> getDatasetsByProjectId(Long projectId) {
        return datasetRepository.findAll().stream()
                .filter(d -> d.getProject().getId().equals(projectId))
                .map(this::mapToDatasetResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DatasetResponse> getDatasetsByIds(List<Long> ids) {
        return datasetRepository.findAllById(ids).stream()
                .map(this::mapToDatasetResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @AuditAction("DELETE_DATASET")
    public void deleteDataset(Long id) {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dataset not found with id " + id));
        dataset.setDeleted(true);
        datasetRepository.save(dataset);

        // Mark images as deleted too
        List<Image> images = imageRepository.findByDatasetId(id);
        images.forEach(i -> i.setDeleted(true));
        imageRepository.saveAll(images);
    }

    private DatasetResponse mapToDatasetResponse(Dataset dataset) {
        int imageCount = imageRepository.findByDatasetId(dataset.getId()).size();
        return DatasetResponse.builder()
                .id(dataset.getId())
                .name(dataset.getName())
                .projectId(dataset.getProject().getId())
                .imageCount(imageCount)
                .createdAt(dataset.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    @AuditAction("UPLOAD_DATASET_BATCH")
    public String uploadBatch(Long projectId, String datasetName, MultipartFile[] images) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id " + projectId));

        // 1. Check total system storage limit
        long totalUsed = storageService.getTotalUsedSize();
        long uploadSize = 0;
        for (MultipartFile file : images) {
            uploadSize += file.getSize();
        }

        long limit = systemConfigService.getMaxStorageLimitBytes();
        if (totalUsed + uploadSize > limit) {
            throw new StorageLimitExceededException(
                    "System storage limit exceeded. Current: " + formatBytes(totalUsed) + ", Upload: " + formatBytes(uploadSize) + ", Limit: " + formatBytes(limit));
        }

        // 1b. Check max files per upload
        int maxFiles = systemConfigService.getMaxFilesPerUpload();
        if (images.length > maxFiles) {
            throw new RuntimeException("Số lượng file upload vượt quá giới hạn cho phép (" + maxFiles + " file)");
        }

        // 2. Check individual file size and type
        long maxFileSize = systemConfigService.getMaxFileSizeNodes();
        List<String> allowedTypes = systemConfigService.getAllowedFileTypes();
        
        for (MultipartFile file : images) {
            if (file.getSize() > maxFileSize) {
                throw new StorageLimitExceededException("File " + file.getOriginalFilename() + " exceeds maximum size limit of " + formatBytes(maxFileSize));
            }
            
            String fileName = file.getOriginalFilename();
            if (fileName != null) {
                String ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
                if (!allowedTypes.contains(ext)) {
                    throw new RuntimeException("File type " + ext + " is not allowed. Allowed types: " + allowedTypes);
                }
            }
        }

        // 3. Check project storage limit
        long projectUsed = storageService.getProjectUsedSize(projectId);
        long projectLimit = systemConfigService.getMaxStoragePerProjectBytes();
        if (projectUsed + uploadSize > projectLimit) {
            throw new StorageLimitExceededException(
                    "Project storage limit exceeded. Current: " + formatBytes(projectUsed) + ", Upload: " + formatBytes(uploadSize) + ", Limit: " + formatBytes(projectLimit));
        }

        Dataset dataset = Dataset.builder()
                .project(project)
                .name(datasetName)
                .deleted(false)
                .build();

        dataset = datasetRepository.save(dataset);

        String prefix = "project_" + projectId + "/dataset_" + dataset.getId();

        List<Image> imageEntities = new ArrayList<>();

        for (MultipartFile file : images) {
            String filePath = storageService.store(file, prefix);

            Image img = Image.builder()
                    .dataset(dataset)
                    .filePath(filePath)
                    .status("PENDING")
                    .deleted(false)
                    .build();

            imageEntities.add(img);
        }

        imageRepository.saveAll(imageEntities);

        return "Successfully uploaded " + images.length + " images to dataset '" + datasetName + "'";
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "i";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImageResponse> getImagesByDatasetId(Long datasetId) {
        return imageRepository.findByDatasetId(datasetId).stream()
                .map(this::mapToImageResponse)
                .collect(Collectors.toList());
    }

    private ImageResponse mapToImageResponse(Image image) {
        String baseUrl = "/api/v1/images";
        return ImageResponse.builder()
                .id(image.getId())
                .name(image.getFilePath().substring(image.getFilePath().lastIndexOf("/") + 1))
                .url(baseUrl + "/serve/" + image.getFilePath())
                .thumbnail(baseUrl + "/thumbnail/" + image.getFilePath())
                .status(image.getStatus())
                .build();
    }
}
