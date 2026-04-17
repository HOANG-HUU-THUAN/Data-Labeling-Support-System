package com.labelingsystem.backend.modules.dataset.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.modules.dataset.dto.response.ImageResponse;
import com.labelingsystem.backend.modules.dataset.service.DatasetService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.labelingsystem.backend.modules.dataset.dto.response.DatasetResponse;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DatasetController {

    DatasetService datasetService;

    @GetMapping("/projects/{projectId}/datasets")
    public ApiResponse<List<DatasetResponse>> getDatasetsByProject(@PathVariable Long projectId) {
        return ApiResponse.success(datasetService.getDatasetsByProjectId(projectId));
    }

    @GetMapping("/datasets")
    public ApiResponse<List<DatasetResponse>> getDatasetsByIds(@RequestParam String ids) {
        List<Long> idList = Arrays.stream(ids.split(","))
                .map(Long::parseLong)
                .collect(Collectors.toList());
        return ApiResponse.success(datasetService.getDatasetsByIds(idList));
    }

    @DeleteMapping("/datasets/{id}")
    public ApiResponse<String> deleteDataset(@PathVariable Long id) {
        datasetService.deleteDataset(id);
        return ApiResponse.success("Dataset deleted successfully");
    }

    @PostMapping(value = "/projects/{projectId}/datasets/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> uploadDatasetBatch(
            @PathVariable Long projectId,
            @RequestParam("name") String datasetName,
            @RequestPart("images") MultipartFile[] images) {
        
        String result = datasetService.uploadBatch(projectId, datasetName, images);
        return ApiResponse.success(result);
    }

    @GetMapping("/datasets/{id}/images")
    public ApiResponse<List<ImageResponse>> getImagesByDataset(@PathVariable Long id) {
        return ApiResponse.success(datasetService.getImagesByDatasetId(id));
    }
}
