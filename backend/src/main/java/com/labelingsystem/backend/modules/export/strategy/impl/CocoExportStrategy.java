package com.labelingsystem.backend.modules.export.strategy.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import java.time.LocalDate;
import java.util.*;

/**
 * COCO Export Strategy – định dạng chính, hỗ trợ cả BBOX và POLYGON segmentation.
 *
 * Cấu trúc ZIP:
 * dataset/
 *   images/
 *   annotations.json
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CocoExportStrategy implements ExportStrategy {

    private final AnnotationRepository annotationRepository;
    private final StorageService storageService;
    private final ObjectMapper objectMapper;

    @Override
    public Map<String, byte[]> export(ExportContext context) throws IOException {
        Map<String, byte[]> exportFiles = new LinkedHashMap<>();

        ObjectNode cocoRoot = objectMapper.createObjectNode();
        buildInfo(cocoRoot, context.projectId());
        buildCategories(cocoRoot, context.labels());

        ArrayNode imagesArr = cocoRoot.putArray("images");
        ArrayNode annotationsArr = cocoRoot.putArray("annotations");

        int annoIdCounter = 1;

        for (Task task : context.approvedTasks()) {
            for (Image image : task.getImages()) {
                BufferedImage bi = readBufferedImage(image.getFilePath());
                if (bi == null) {
                    log.warn("[COCO] Bỏ qua ảnh không đọc được: {}", image.getFilePath());
                    continue;
                }

                int imgWidth = bi.getWidth();
                int imgHeight = bi.getHeight();
                String fileName = extractFileName(image.getFilePath());

                // Export image bytes vào zip
                byte[] imageBytes = readImageBytes(image.getFilePath());
                if (imageBytes != null) {
                    exportFiles.put("images/" + fileName, imageBytes);
                }

                // Build COCO image node
                ObjectNode imgNode = imagesArr.addObject();
                imgNode.put("id", image.getId());
                imgNode.put("file_name", fileName);
                imgNode.put("width", imgWidth);
                imgNode.put("height", imgHeight);

                // Fetch annotations
                List<Annotation> annotations = annotationRepository.findByImageIdWithLabel(image.getId());
                for (Annotation anno : annotations) {
                    if (anno.getLabel() == null) {
                        log.warn("[COCO] Bỏ qua annotation id={}: label null", anno.getId());
                        continue;
                    }

                    String type = anno.getType();
                    JsonNode coords = anno.getCoordinates();

                    if ("BOX".equals(type)) {
                        annoIdCounter = buildBboxAnnotation(annotationsArr, anno, coords,
                                context.labelIdToCocoIdx(), image.getId(), annoIdCounter, imgWidth, imgHeight);
                    } else if ("POLYGON".equals(type)) {
                        annoIdCounter = buildPolygonAnnotation(annotationsArr, anno, coords,
                                context.labelIdToCocoIdx(), image.getId(), annoIdCounter, imgWidth, imgHeight);
                    } else {
                        log.warn("[COCO] Bỏ qua annotation type không hỗ trợ: {}", type);
                    }
                }
            }
        }

        exportFiles.put("annotations.json",
                objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(cocoRoot));

        return exportFiles;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private void buildInfo(ObjectNode cocoRoot, Long projectId) {
        ObjectNode info = cocoRoot.putObject("info");
        info.put("description", "Exported from Labeling System – Project ID " + projectId);
        info.put("version", "1.0");
        info.put("year", LocalDate.now().getYear());
        info.put("date_created", LocalDate.now().toString());
    }

    private void buildCategories(ObjectNode cocoRoot, List<Label> labels) {
        ArrayNode categories = cocoRoot.putArray("categories");
        for (int i = 0; i < labels.size(); i++) {
            Label label = labels.get(i);
            ObjectNode cat = categories.addObject();
            cat.put("id", i + 1);
            cat.put("name", label.getName());
            cat.put("supercategory", "none");
        }
    }

    /** Build annotation node cho loại BOX. Segmentation = 4 góc polygon. */
    private int buildBboxAnnotation(ArrayNode annotationsArr, Annotation anno, JsonNode coords,
            Map<Long, Integer> labelIdToCocoIdx, Long imageId, int annoId, int imgW, int imgH) {

        double x = coords.has("x") ? coords.get("x").asDouble() : 0;
        double y = coords.has("y") ? coords.get("y").asDouble() : 0;
        double w = coords.has("w") ? coords.get("w").asDouble() : 0;
        double h = coords.has("h") ? coords.get("h").asDouble() : 0;

        if (w <= 0 || h <= 0) {
            log.warn("[COCO] Bỏ qua BOX invalid (w={}, h={})", w, h);
            return annoId;
        }

        // Clamp vào image bounds
        x = Math.max(0, Math.min(x, imgW));
        y = Math.max(0, Math.min(y, imgH));
        w = Math.min(w, imgW - x);
        h = Math.min(h, imgH - y);

        int categoryId = labelIdToCocoIdx.getOrDefault(anno.getLabel().getId(), 0) + 1;

        ObjectNode annoNode = annotationsArr.addObject();
        annoNode.put("id", annoId);
        annoNode.put("image_id", imageId);
        annoNode.put("category_id", categoryId);

        ArrayNode bbox = annoNode.putArray("bbox");
        bbox.add(x).add(y).add(w).add(h);
        annoNode.put("area", w * h);
        annoNode.put("iscrowd", 0);

        // Segmentation: 4 góc của bbox
        ArrayNode segmentation = annoNode.putArray("segmentation");
        ArrayNode poly = segmentation.addArray();
        poly.add(x).add(y)
            .add(x + w).add(y)
            .add(x + w).add(y + h)
            .add(x).add(y + h);

        return annoId + 1;
    }

    /**
     * Build annotation node cho loại POLYGON.
     * Hỗ trợ 2 format JSON: [{x,y},...] hoặc flat [x1,y1,x2,y2,...].
     */
    private int buildPolygonAnnotation(ArrayNode annotationsArr, Annotation anno, JsonNode coords,
            Map<Long, Integer> labelIdToCocoIdx, Long imageId, int annoId, int imgW, int imgH) {

        List<Double> flatPoints = extractPolygonPoints(coords);

        if (flatPoints.size() < 6) {
            log.warn("[COCO] Bỏ qua POLYGON annotation: ít hơn 3 điểm");
            return annoId;
        }

        // Tính bbox từ polygon points
        double minX = Double.MAX_VALUE, minY = Double.MAX_VALUE;
        double maxX = Double.MIN_VALUE, maxY = Double.MIN_VALUE;
        for (int i = 0; i < flatPoints.size() - 1; i += 2) {
            double px = flatPoints.get(i);
            double py = flatPoints.get(i + 1);
            minX = Math.min(minX, px);
            minY = Math.min(minY, py);
            maxX = Math.max(maxX, px);
            maxY = Math.max(maxY, py);
        }

        double bboxW = maxX - minX;
        double bboxH = maxY - minY;
        if (bboxW <= 0 || bboxH <= 0) {
            log.warn("[COCO] Bỏ qua POLYGON: bbox degenerate");
            return annoId;
        }

        int categoryId = labelIdToCocoIdx.getOrDefault(anno.getLabel().getId(), 0) + 1;

        ObjectNode annoNode = annotationsArr.addObject();
        annoNode.put("id", annoId);
        annoNode.put("image_id", imageId);
        annoNode.put("category_id", categoryId);

        ArrayNode bbox = annoNode.putArray("bbox");
        bbox.add(minX).add(minY).add(bboxW).add(bboxH);
        annoNode.put("area", bboxW * bboxH);
        annoNode.put("iscrowd", 0);

        ArrayNode segmentation = annoNode.putArray("segmentation");
        ArrayNode poly = segmentation.addArray();
        flatPoints.forEach(poly::add);

        return annoId + 1;
    }

    /**
     * Trích xuất flat list point từ JSON polygon.
     * Hỗ trợ: [{x,y},...] hoặc [x1,y1,x2,y2,...] hoặc [[x1,y1,...]]
     */
    private List<Double> extractPolygonPoints(JsonNode coords) {
        List<Double> points = new ArrayList<>();

        if (coords.isArray() && coords.size() > 0) {
            JsonNode first = coords.get(0);

            if (first.isObject()) {
                // Format: [{x,y},...]
                for (JsonNode pt : coords) {
                    points.add(pt.has("x") ? pt.get("x").asDouble() : 0);
                    points.add(pt.has("y") ? pt.get("y").asDouble() : 0);
                }
            } else if (first.isArray()) {
                // Format: [[x1,y1,x2,y2,...]]
                for (JsonNode val : first) {
                    points.add(val.asDouble());
                }
            } else {
                // Format: [x1,y1,x2,y2,...]
                for (JsonNode val : coords) {
                    points.add(val.asDouble());
                }
            }
        } else if (coords.has("points")) {
            // Format: {"points": [{x,y},...]}
            return extractPolygonPoints(coords.get("points"));
        }

        return points;
    }

    private BufferedImage readBufferedImage(String filePath) {
        try {
            Resource resource = storageService.loadAsResource(filePath);
            return ImageIO.read(resource.getInputStream());
        } catch (Exception e) {
            log.error("[COCO] Không đọc được ảnh {}: {}", filePath, e.getMessage());
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
            log.error("[COCO] Không đọc được bytes ảnh {}: {}", filePath, e.getMessage());
            return null;
        }
    }

    private String extractFileName(String filePath) {
        return filePath.substring(filePath.lastIndexOf("/") + 1);
    }
}
