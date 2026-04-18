package com.labelingsystem.backend.modules.export.strategy;

import java.io.IOException;
import java.util.Map;

/**
 * Strategy interface cho từng định dạng export.
 * Mỗi implementation trả về Map<zipEntryPath, fileBytes>.
 */
public interface ExportStrategy {
    /**
     * Thực hiện export và trả về map: đường dẫn trong ZIP → nội dung bytes.
     *
     * @param context dữ liệu export đã được fetch sẵn
     * @return map các file cần đưa vào ZIP
     */
    Map<String, byte[]> export(ExportContext context) throws IOException;
}
