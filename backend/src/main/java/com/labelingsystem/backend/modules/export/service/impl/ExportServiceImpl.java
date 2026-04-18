package com.labelingsystem.backend.modules.export.service.impl;

import com.labelingsystem.backend.common.utils.ZipUtils;
import com.labelingsystem.backend.modules.audit.aspect.AuditAction;
import com.labelingsystem.backend.modules.export.dto.ExportFormat;
import com.labelingsystem.backend.modules.export.service.ExportService;
import com.labelingsystem.backend.modules.export.strategy.ExportContext;
import com.labelingsystem.backend.modules.export.strategy.ExportStrategyFactory;
import com.labelingsystem.backend.modules.project.entity.Label;
import com.labelingsystem.backend.modules.project.repository.LabelRepository;
import com.labelingsystem.backend.modules.task.entity.Task;
import com.labelingsystem.backend.modules.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service điều phối export dataset.
 * Chỉ làm 3 việc: fetch data → build ExportContext → delegate sang strategy → đóng ZIP.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExportServiceImpl implements ExportService {

    private final TaskRepository taskRepository;
    private final LabelRepository labelRepository;
    private final ExportStrategyFactory strategyFactory;

    @Override
    @AuditAction("EXPORT_PROJECT_DATA")
    public byte[] exportProjectData(Long projectId, ExportFormat format) throws IOException {
        List<Task> approvedTasks = taskRepository.findByProjectIdAndStatus(projectId, "APPROVED");
        List<Label> labels = labelRepository.findByProjectId(projectId);

        Map<Long, Integer> labelIdToCocoIdx = buildLabelIndex(labels);
        ExportContext context = new ExportContext(projectId, approvedTasks, labels, labelIdToCocoIdx);

        log.info("[Export] projectId={} format={} approvedTasks={}", projectId, format, approvedTasks.size());

        Map<String, byte[]> exportFiles = strategyFactory.getStrategy(format).export(context);
        return ZipUtils.createZip(exportFiles);
    }

    /**
     * Tạo map: labelId → 0-based index (dùng để tính COCO category_id = index + 1).
     */
    private Map<Long, Integer> buildLabelIndex(List<Label> labels) {
        Map<Long, Integer> index = new HashMap<>();
        for (int i = 0; i < labels.size(); i++) {
            index.put(labels.get(i).getId(), i);
        }
        return index;
    }
}
