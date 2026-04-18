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
            if (!"BOX".equals(anno.getType())) continue;
            if (anno.getLabel() == null) {
                log.warn("[VOC] Bỏ qua annotation: label null");
                continue;
            }

            JsonNode coords = anno.getCoordinates();
            double x = coords.has("x") ? coords.get("x").asDouble() : 0;
            double y = coords.has("y") ? coords.get("y").asDouble() : 0;
            double w = coords.has("w") ? coords.get("w").asDouble() : 0;
            double h = coords.has("h") ? coords.get("h").asDouble() : 0;

            if (w <= 0 || h <= 0) {
                log.warn("[VOC] Bỏ qua BBOX invalid (w={}, h={})", w, h);
                continue;
            }

            // Clamp và tính xmin/ymin/xmax/ymax
            int xmin = (int) Math.max(0, Math.min(x, imgWidth));
            int ymin = (int) Math.max(0, Math.min(y, imgHeight));
            int xmax = (int) Math.max(0, Math.min(x + w, imgWidth));
            int ymax = (int) Math.max(0, Math.min(y + h, imgHeight));

            if (xmax <= xmin || ymax <= ymin) {
                log.warn("[VOC] Bỏ qua BBOX sau khi clamp: hộp bị degenerate");
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
}
