package com.labelingsystem.backend.common.utils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ZipUtils {

    /**
     * Tạo file ZIP từ map path → bytes.
     * Nếu bytes == null → tạo directory entry (thư mục rỗng).
     */
    public static byte[] createZip(Map<String, byte[]> files) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (Map.Entry<String, byte[]> file : files.entrySet()) {
                if (file.getValue() == null) {
                    // Directory entry: key phải kết thúc bằng '/'
                    String dirPath = file.getKey().endsWith("/") ? file.getKey() : file.getKey() + "/";
                    zos.putNextEntry(new ZipEntry(dirPath));
                    zos.closeEntry();
                } else {
                    ZipEntry entry = new ZipEntry(file.getKey());
                    zos.putNextEntry(entry);
                    zos.write(file.getValue());
                    zos.closeEntry();
                }
            }
            zos.finish();
            return baos.toByteArray();
        }
    }
}

