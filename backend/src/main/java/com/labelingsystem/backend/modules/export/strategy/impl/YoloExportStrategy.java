package com.labelingsystem.backend.modules.export.strategy.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.labelingsystem.backend.modules.annotation.entity.Annotation;
import com.labelingsystem.backend.modules.annotation.repository.AnnotationRepository;
import com.labelingsystem.backend.modules.dataset.entity.Image;
import com.labelingsystem.backend.modules.dataset.storage.StorageService;
import com.labelingsystem.backend.modules.export.strategy.ExportContext;
import com.labelingsystem.backend.modules.export.strategy.ExportStrategy;
import com.labelingsystem.backend.modules.project.entity.Label;
import com.labelingsystem.backend.modules.task.entity.Task;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * YOLO Export Strategy – hỗ trợ BBOX only, normalize tọa độ về [0,1].
 *
 * Cấu trúc ZIP:
 * dataset/
 *   images/
 *   labels/
 *   classes.txt
 *   dataset.yaml
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class YoloExportStrategy implements ExportStrategy {

    private final AnnotationRepository annotationRepository;
    private final StorageService storageService;

    @Override
    public Map<String, byte[]> export(ExportContext context) throws IOException {
        Map<String, byte[]> exportFiles = new LinkedHashMap<>();

        List<Label> labels = context.labels();

        // Tạo directory entries để đảm bảo thư mục luôn tồn tại trong ZIP
        exportFiles.put("images/", null);
        exportFiles.put("labels/", null);

        // classes.txt
        exportFiles.put("classes.txt", buildClassesTxt(labels));

        // dataset.yaml
        exportFiles.put("dataset.yaml", buildDatasetYaml(labels));

        for (Task task : context.approvedTasks()) {
            for (Image image : task.getImages()) {
                BufferedImage bi = readBufferedImage(image.getFilePath());
                if (bi == null) {
                    log.warn("[YOLO] Bỏ qua ảnh không đọc được: {}", image.getFilePath());
                    continue;
                }

                int imgWidth = bi.getWidth();
                int imgHeight = bi.getHeight();
                String fileName = extractFileName(image.getFilePath());

                // Export image bytes vào images/
                byte[] imageBytes = readImageBytes(image.getFilePath());
                if (imageBytes != null) {
                    exportFiles.put("images/" + fileName, imageBytes);
                }

                // Build label file
                List<Annotation> annotations = annotationRepository.findByImageIdWithLabel(image.getId());
                String labelContent = buildYoloLabelContent(annotations, context.labelIdToCocoIdx(),
                        imgWidth, imgHeight);

                if (!labelContent.isEmpty()) {
                    String labelFileName = stripExtension(fileName) + ".txt";
                    exportFiles.put("labels/" + labelFileName,
                            labelContent.getBytes(StandardCharsets.UTF_8));
                }
            }
        }

        return exportFiles;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private byte[] buildClassesTxt(List<Label> labels) {
        StringBuilder sb = new StringBuilder();
        for (Label label : labels) {
            sb.append(label.getName()).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private byte[] buildDatasetYaml(List<Label> labels) {
        StringBuilder sb = new StringBuilder();
        sb.append("train: ./images\n");
        sb.append("val: ./images\n\n");
        sb.append("nc: ").append(labels.size()).append("\n");
        sb.append("names: [");
        for (int i = 0; i < labels.size(); i++) {
            sb.append("\"").append(labels.get(i).getName()).append("\"");
            if (i < labels.size() - 1) sb.append(", ");
        }
        sb.append("]\n");
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String buildYoloLabelContent(List<Annotation> annotations, Map<Long, Integer> labelIdToCocoIdx,
            int imgWidth, int imgHeight) {
        StringBuilder sb = new StringBuilder();

        for (Annotation anno : annotations) {
            if (!"BOX".equals(anno.getType())) continue;
            if (anno.getLabel() == null) {
                log.warn("[YOLO] Bỏ qua annotation id={}: label null", anno.getId());
                continue;
            }

            JsonNode coords = anno.getCoordinates();
            double x = coords.has("x") ? coords.get("x").asDouble() : 0;
            double y = coords.has("y") ? coords.get("y").asDouble() : 0;
            double w = coords.has("w") ? coords.get("w").asDouble() : 0;
            double h = coords.has("h") ? coords.get("h").asDouble() : 0;

            if (w <= 0 || h <= 0) {
                log.warn("[YOLO] Bỏ qua BBOX invalid (w={}, h={})", w, h);
                continue;
            }

            // Normalize
            double xCenter = (x + w / 2.0) / imgWidth;
            double yCenter = (y + h / 2.0) / imgHeight;
            double normW = w / imgWidth;
            double normH = h / imgHeight;

            // Clamp về [0, 1]
            xCenter = clamp(xCenter, 0.0, 1.0);
            yCenter = clamp(yCenter, 0.0, 1.0);
            normW = clamp(normW, 0.0, 1.0);
            normH = clamp(normH, 0.0, 1.0);

            if (normW <= 0 || normH <= 0) continue;

            int classIdx = labelIdToCocoIdx.getOrDefault(anno.getLabel().getId(), 0);
            sb.append(String.format(Locale.US, "%d %.6f %.6f %.6f %.6f\n",
                    classIdx, xCenter, yCenter, normW, normH));
        }

        return sb.toString();
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private BufferedImage readBufferedImage(String filePath) {
        try {
            Resource resource = storageService.loadAsResource(filePath);
            return ImageIO.read(resource.getInputStream());
        } catch (Exception e) {
            log.error("[YOLO] Không đọc được ảnh {}: {}", filePath, e.getMessage());
            return null;
        }
    }

    private byte[] readImageBytes(String filePath) {
        try {
            Resource resource = storageService.loadAsResource(filePath);
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                resource.getInputStream().transferTo(baos);
                return baos.toByteArray();
            }
        } catch (Exception e) {
            log.error("[YOLO] Không đọc được bytes ảnh {}: {}", filePath, e.getMessage());
            return null;
        }
    }

    private String extractFileName(String filePath) {
        return filePath.substring(filePath.lastIndexOf("/") + 1);
    }

    private String stripExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf(".");
        return dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
    }
}
