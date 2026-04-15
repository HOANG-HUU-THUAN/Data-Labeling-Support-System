package com.labelingsystem.backend.modules.dataset.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.dataset.service.DatasetService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DatasetController {

    DatasetService datasetService;

    @PostMapping(value = "/{projectId}/datasets/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    //@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ApiResponse<String> uploadDatasetBatch(
            @PathVariable Long projectId,
            @RequestParam("name") String datasetName,
            @RequestPart("images") MultipartFile[] images) {
        
        String result = datasetService.uploadBatch(projectId, datasetName, images);
        return ApiResponse.success(result);
    }
}
