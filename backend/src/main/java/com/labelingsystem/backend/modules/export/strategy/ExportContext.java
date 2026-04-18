package com.labelingsystem.backend.modules.export.strategy;

import com.labelingsystem.backend.modules.project.entity.Label;
import com.labelingsystem.backend.modules.task.entity.Task;

import java.util.List;
import java.util.Map;

/**
 * Context object chứa tất cả dữ liệu cần thiết để thực hiện export.
 * Được truyền vào mọi ExportStrategy để tránh fetch DB nhiều lần.
 */
public record ExportContext(
        Long projectId,
        List<Task> approvedTasks,
        List<Label> labels,
        Map<Long, Integer> labelIdToCocoIdx  // 0-based → dùng +1 để thành COCO category_id
) {
}
