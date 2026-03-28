package com.labelingsystem.backend.modules.dataset.service.impl;

import com.labelingsystem.backend.common.exception.ResourceNotFoundException;
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

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DatasetServiceImpl implements DatasetService {

    ProjectRepository projectRepository;
    DatasetRepository datasetRepository;
    ImageRepository imageRepository;
    StorageService storageService;

    @Override
    @Transactional
    public String uploadBatch(Long projectId, String datasetName, MultipartFile[] images) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id " + projectId));

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
}
