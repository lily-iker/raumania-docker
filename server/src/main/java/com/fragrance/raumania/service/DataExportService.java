package com.fragrance.raumania.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.service.interfaces.BrandService;
import com.fragrance.raumania.service.interfaces.ProductIndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataExportService {

    private final ProductIndexService productIndexService;
    private final BrandService brandService;
    private final ObjectMapper objectMapper;

    private static final String UPLOAD_DIR = "/app/uploads";

    @Scheduled(cron = "0 0 2 * * *") // Runs every day at 02:00:00 AM
    public void cronjob() {
        exportData("product.json", productIndexService.getAllForDataExport());
        exportData("brand.json", brandService.getAllForDataExport());
    }

    public void exportData(String fileName, Object data) {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        File outputFile = new File(uploadDir, fileName);

        try (FileOutputStream out = new FileOutputStream(outputFile)) {
            objectMapper.writeValue(out, data);
            log.info("✅ Exported data to {}" , outputFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("❌ Failed to export {} to JSON", fileName, e);
        }
    }

    public void exportData(String fileName, PageResponse<?> data) {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        File outputFile = new File(uploadDir, fileName);

        try (FileOutputStream out = new FileOutputStream(outputFile)) {
            objectMapper.writeValue(out, data);
            log.info("✅ Exported {} entries to {}", data.getTotalElements(), outputFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("❌ Failed to export {} to JSON", fileName, e);
        }
    }
}