package com.labelingsystem.backend.modules.export.strategy;

import com.labelingsystem.backend.modules.export.dto.ExportFormat;
import com.labelingsystem.backend.modules.export.strategy.impl.CocoExportStrategy;
import com.labelingsystem.backend.modules.export.strategy.impl.PascalVocExportStrategy;
import com.labelingsystem.backend.modules.export.strategy.impl.YoloExportStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Factory chọn đúng ExportStrategy theo ExportFormat.
 */
@Component
@RequiredArgsConstructor
public class ExportStrategyFactory {

    private final CocoExportStrategy cocoStrategy;
    private final YoloExportStrategy yoloStrategy;
    private final PascalVocExportStrategy pascalVocStrategy;

    public ExportStrategy getStrategy(ExportFormat format) {
        return switch (format) {
            case COCO -> cocoStrategy;
            case YOLO -> yoloStrategy;
            case PASCAL_VOC -> pascalVocStrategy;
        };
    }
}
