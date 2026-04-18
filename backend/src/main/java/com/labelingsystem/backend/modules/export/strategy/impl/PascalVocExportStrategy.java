package com.labelingsystem.backend.modules.export.strategy.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.labelingsystem.backend.modules.annotation.entity.Annotation;
import com.labelingsystem.backend.modules.annotation.repository.AnnotationRepository;
import com.labelingsystem.backend.modules.dataset.entity.Image;
import com.labelingsystem.backend.modules.dataset.storage.StorageService;
import com.labelingsystem.backend.modules.export.strategy.ExportContext;
import com.labelingsystem.backend.modules.export.strategy.ExportStrategy;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Pascal VOC Export Strategy – hỗ trợ BBOX only.
 *
 * Cấu trúc ZIP:
 * dataset/
 *   JPEGImages/
 *   Annotations/
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PascalVocExportStrategy implements ExportStrategy {

    private final AnnotationRepository annotationRepository;
    private final StorageService storageService;

    @Override
    public Map<String, byte[]> export(ExportContext context) throws IOException {
        Map<String, byte[]> exportFiles = new LinkedHashMap<>();

        // Đảm bảo các thư mục luôn tồn tại trong ZIP (kể cả khi không có file nào)
        exportFiles.put("JPEGImages/", null);
        exportFiles.put("Annotations/", null);

        for (Task task : context.approvedTasks()) {
            for (Image image : task.getImages()) {
                BufferedImage bi = readBufferedImage(image.getFilePath());
                if (bi == null) {
                    log.warn("[VOC] Bỏ qua ảnh không đọc được: {}", image.getFilePath());
                    continue;
                }

                int imgWidth = bi.getWidth();
                int imgHeight = bi.getHeight();
                String fileName = extractFileName(image.getFilePath());

                // Export image bytes vào JPEGImages/
                byte[] imageBytes = readImageBytes(image.getFilePath());
                if (imageBytes != null) {
                    exportFiles.put("JPEGImages/" + fileName, imageBytes);
                }

                // Build XML annotation
                List<Annotation> annotations = annotationRepository.findByImageIdWithLabel(image.getId());
                String xmlContent = buildVocXml(fileName, imgWidth, imgHeight, annotations);

                if (xmlContent != null) {
                    String xmlFileName = stripExtension(fileName) + ".xml";
                    exportFiles.put("Annotations/" + xmlFileName,
                            xmlContent.getBytes(StandardCharsets.UTF_8));
                }
            }
        }

        return exportFiles;
    }


    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private String buildVocXml(String fileName, int imgWidth, int imgHeight,
            List<Annotation> annotations) {

        StringBuilder objectsXml = new StringBuilder();

        for (Annotation anno : annotations) {
            if (anno.getLabel() == null) {
                log.warn("[VOC] Bỏ qua annotation: label null");
                continue;
            }

            String type = anno.getType();
            JsonNode coords = anno.getCoordinates();
            int xmin, ymin, xmax, ymax;

            if ("BOX".equals(type)) {
                double x = coords.has("x") ? coords.get("x").asDouble() : 0;
                double y = coords.has("y") ? coords.get("y").asDouble() : 0;
                double w = coords.has("w") ? coords.get("w").asDouble() : 0;
                double h = coords.has("h") ? coords.get("h").asDouble() : 0;

                if (w <= 0 || h <= 0) {
                    log.warn("[VOC] Bỏ qua BOX invalid (w={}, h={})", w, h);
                    continue;
                }

                xmin = (int) Math.max(0, Math.min(x, imgWidth));
                ymin = (int) Math.max(0, Math.min(y, imgHeight));
                xmax = (int) Math.max(0, Math.min(x + w, imgWidth));
                ymax = (int) Math.max(0, Math.min(y + h, imgHeight));

            } else if ("POLYGON".equals(type)) {
                List<Double> pts = extractPolygonPoints(coords);
                if (pts.size() < 6) {
                    log.warn("[VOC] Bỏ qua POLYGON: ít hơn 3 điểm");
                    continue;
                }

                // Tính bounding box bao quanh polygon
                double minX = Double.MAX_VALUE, minY = Double.MAX_VALUE;
                double maxX = -Double.MAX_VALUE, maxY = -Double.MAX_VALUE;
                for (int i = 0; i < pts.size() - 1; i += 2) {
                    minX = Math.min(minX, pts.get(i));
                    minY = Math.min(minY, pts.get(i + 1));
                    maxX = Math.max(maxX, pts.get(i));
                    maxY = Math.max(maxY, pts.get(i + 1));
                }

                xmin = (int) Math.max(0, Math.min(minX, imgWidth));
                ymin = (int) Math.max(0, Math.min(minY, imgHeight));
                xmax = (int) Math.max(0, Math.min(maxX, imgWidth));
                ymax = (int) Math.max(0, Math.min(maxY, imgHeight));

            } else {
                log.warn("[VOC] Bỏ qua annotation type không hỗ trợ: {}", type);
                continue;
            }

            if (xmax <= xmin || ymax <= ymin) {
                log.warn("[VOC] Bỏ qua annotation sau khi clamp: hộp bị degenerate");
                continue;
            }

            objectsXml.append("  <object>\n");
            objectsXml.append("    <name>").append(escapeXml(anno.getLabel().getName())).append("</name>\n");
            objectsXml.append("    <pose>Unspecified</pose>\n");
            objectsXml.append("    <truncated>0</truncated>\n");
            objectsXml.append("    <difficult>0</difficult>\n");
            objectsXml.append("    <bndbox>\n");
            objectsXml.append("      <xmin>").append(xmin).append("</xmin>\n");
            objectsXml.append("      <ymin>").append(ymin).append("</ymin>\n");
            objectsXml.append("      <xmax>").append(xmax).append("</xmax>\n");
            objectsXml.append("      <ymax>").append(ymax).append("</ymax>\n");
            objectsXml.append("    </bndbox>\n");
            objectsXml.append("  </object>\n");
        }

        if (objectsXml.isEmpty()) {
            return null; // Không có object hợp lệ → không tạo file XML
        }

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<annotation>\n");
        xml.append("  <folder>JPEGImages</folder>\n");
        xml.append("  <filename>").append(escapeXml(fileName)).append("</filename>\n");
        xml.append("  <path>JPEGImages/").append(escapeXml(fileName)).append("</path>\n");
        xml.append("  <source>\n");
        xml.append("    <database>Labeling System</database>\n");
        xml.append("  </source>\n");
        xml.append("  <size>\n");
        xml.append("    <width>").append(imgWidth).append("</width>\n");
        xml.append("    <height>").append(imgHeight).append("</height>\n");
        xml.append("    <depth>3</depth>\n");
        xml.append("  </size>\n");
        xml.append("  <segmented>0</segmented>\n");
        xml.append(objectsXml);
        xml.append("</annotation>\n");

        return xml.toString();
    }

    private String escapeXml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private BufferedImage readBufferedImage(String filePath) {
        try {
            Resource resource = storageService.loadAsResource(filePath);
            return ImageIO.read(resource.getInputStream());
        } catch (Exception e) {
            log.error("[VOC] Không đọc được ảnh {}: {}", filePath, e.getMessage());
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
            log.error("[VOC] Không đọc được bytes ảnh {}: {}", filePath, e.getMessage());
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
}
