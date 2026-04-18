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

    /**
     * Build nội dung file label YOLO cho 1 ảnh.
     * - BOX  → "classId xCenter yCenter w h" (tất cả normalize [0,1])
     * - POLYGON → "classId x1 y1 x2 y2 ... xn yn" (YOLOv8 segmentation, normalize [0,1])
     */
    private String buildYoloLabelContent(List<Annotation> annotations, Map<Long, Integer> labelIdToCocoIdx,
            int imgWidth, int imgHeight) {
        StringBuilder sb = new StringBuilder();

        for (Annotation anno : annotations) {
            if (anno.getLabel() == null) {
                log.warn("[YOLO] Bỏ qua annotation id={}: label null", anno.getId());
                continue;
            }

            int classIdx = labelIdToCocoIdx.getOrDefault(anno.getLabel().getId(), 0);
            JsonNode coords = anno.getCoordinates();
            String type = anno.getType();

            if ("BOX".equals(type)) {
                String line = buildBoxLine(classIdx, coords, imgWidth, imgHeight);
                if (line != null) sb.append(line);

            } else if ("POLYGON".equals(type)) {
                String line = buildPolygonLine(classIdx, coords, imgWidth, imgHeight);
                if (line != null) sb.append(line);

            } else {
                log.warn("[YOLO] Bỏ qua annotation type không hỗ trợ: {}", type);
            }
        }

        return sb.toString();
    }

    /** BOX → "classId xCenter yCenter normW normH\n" */
    private String buildBoxLine(int classIdx, JsonNode coords, int imgWidth, int imgHeight) {
        double x = coords.has("x") ? coords.get("x").asDouble() : 0;
        double y = coords.has("y") ? coords.get("y").asDouble() : 0;
        double w = coords.has("w") ? coords.get("w").asDouble() : 0;
        double h = coords.has("h") ? coords.get("h").asDouble() : 0;

        if (w <= 0 || h <= 0) {
            log.warn("[YOLO] Bỏ qua BOX invalid (w={}, h={})", w, h);
            return null;
        }

        double xCenter = clamp((x + w / 2.0) / imgWidth, 0.0, 1.0);
        double yCenter = clamp((y + h / 2.0) / imgHeight, 0.0, 1.0);
        double normW   = clamp(w / imgWidth, 0.0, 1.0);
        double normH   = clamp(h / imgHeight, 0.0, 1.0);

        if (normW <= 0 || normH <= 0) return null;

        return String.format(Locale.US, "%d %.6f %.6f %.6f %.6f%n", classIdx, xCenter, yCenter, normW, normH);
    }

    /**
     * POLYGON → "classId x1_norm y1_norm x2_norm y2_norm ... xn_norm yn_norm\n"
     * Format YOLOv8 segmentation.
     */
    private String buildPolygonLine(int classIdx, JsonNode coords, int imgWidth, int imgHeight) {
        List<Double> flatPoints = extractPolygonPoints(coords);

        if (flatPoints.size() < 6) {
            log.warn("[YOLO] Bỏ qua POLYGON: ít hơn 3 điểm");
            return null;
        }

        StringBuilder sb = new StringBuilder();
        sb.append(classIdx);

        for (int i = 0; i < flatPoints.size() - 1; i += 2) {
            double xNorm = clamp(flatPoints.get(i) / imgWidth, 0.0, 1.0);
            double yNorm = clamp(flatPoints.get(i + 1) / imgHeight, 0.0, 1.0);
            sb.append(String.format(Locale.US, " %.6f %.6f", xNorm, yNorm));
        }
        sb.append(System.lineSeparator());
        return sb.toString();
    }

    /**
     * Trích xuất flat list [x1,y1,x2,y2,...] từ JSON polygon.
     * Hỗ trợ: [{x,y},...] | [x1,y1,...] | [[x1,y1,...]] | {points:[...]}
     */
    private List<Double> extractPolygonPoints(JsonNode coords) {
        List<Double> points = new ArrayList<>();

        if (coords.isArray() && coords.size() > 0) {
            JsonNode first = coords.get(0);
            if (first.isObject()) {
                for (JsonNode pt : coords) {
                    points.add(pt.has("x") ? pt.get("x").asDouble() : 0);
                    points.add(pt.has("y") ? pt.get("y").asDouble() : 0);
                }
            } else if (first.isArray()) {
                for (JsonNode val : first) points.add(val.asDouble());
            } else {
                for (JsonNode val : coords) points.add(val.asDouble());
            }
        } else if (coords.has("points")) {
            return extractPolygonPoints(coords.get("points"));
        }

        return points;
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
