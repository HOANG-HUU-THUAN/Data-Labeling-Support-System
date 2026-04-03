package com.labelingsystem.backend.modules.dataset.storage.impl;

import com.labelingsystem.backend.config.StorageConfig;
import com.labelingsystem.backend.modules.dataset.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocalStorageServiceImpl implements StorageService {

    private final StorageConfig storageConfig;
    private static final String THUMB_PREFIX = "thumbnails/";

    @Override
    public String store(MultipartFile file, String prefix) {
        try {
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String extension = "";
            int i = originalFilename.lastIndexOf('.');
            if (i > 0) {
                extension = originalFilename.substring(i);
            }
            
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            String relativePath = (prefix != null && !prefix.isEmpty()) ? prefix + "/" + uniqueFilename : uniqueFilename;
            
            Path uploadPath = Paths.get(storageConfig.getLocalDir()).toAbsolutePath().normalize();
            Path targetLocation = uploadPath.resolve(relativePath).normalize();

            // Create directories if they do not exist
            Files.createDirectories(targetLocation.getParent());

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return relativePath;
        } catch (IOException ex) {
            log.error("Could not store file.", ex);
            throw new RuntimeException("Could not store file. Please try again!", ex); 
        }
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {

            if(filename.startsWith("/")){
                filename = filename.substring(1);
            }
            if (filename.startsWith("upload/")){
                filename = filename.substring(8);
            }

            Path file = Paths.get(storageConfig.getLocalDir()).resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Could not read file: " + filename, ex);
        }
    }

    @Override
    public Resource loadThumbnailAsResource(String filename) {
        try {

            if(filename.startsWith("/")){
                filename = filename.substring(1);
            }
            if (filename.startsWith("upload/")){
                filename = filename.substring(8);
            }

            Path rootPath = Paths.get(storageConfig.getLocalDir());
            Path originalFile = rootPath.resolve(filename).normalize();
            Path thumbFile = rootPath.resolve(THUMB_PREFIX + filename).normalize();

            if (!Files.exists(thumbFile)) {
                generateThumbnail(originalFile, thumbFile);
            }

            Resource resource = new UrlResource(thumbFile.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                return loadAsResource(filename); // Fallback to original if thumb fails
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Could not read thumbnail: " + filename, ex);
        }
    }

    private void generateThumbnail(Path source, Path target) {
        try {
            Files.createDirectories(target.getParent());
            Thumbnails.of(source.toFile())
                    .size(200, 200)
                    .keepAspectRatio(true)
                    .toFile(target.toFile());
            log.info("Generated thumbnail for: {}", source.getFileName());
        } catch (IOException ex) {
            log.error("Error generating thumbnail for {}", source, ex);
        }
    }
}
