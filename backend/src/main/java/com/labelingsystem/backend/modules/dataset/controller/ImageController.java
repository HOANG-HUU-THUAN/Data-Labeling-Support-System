package com.labelingsystem.backend.modules.dataset.controller;

import com.labelingsystem.backend.modules.dataset.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageController {

    private final StorageService storageService;

    @GetMapping("/serve/{*filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename, HttpServletRequest request) {
        Resource resource = storageService.loadAsResource(filename);
        return createResponse(resource, request);
    }

    @GetMapping("/thumbnail/{*filename}")
    public ResponseEntity<Resource> serveThumbnail(@PathVariable String filename, HttpServletRequest request) {
        Resource resource = storageService.loadThumbnailAsResource(filename);
        return createResponse(resource, request);
    }

    private ResponseEntity<Resource> createResponse(Resource resource, HttpServletRequest request) {
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Default to octet-stream if type cannot be determined
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
