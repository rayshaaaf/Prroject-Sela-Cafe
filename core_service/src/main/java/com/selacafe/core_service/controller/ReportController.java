package com.selacafe.core_service.controller;

import com.selacafe.core_service.service.ExcelReportService;
import com.selacafe.core_service.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final PdfReportService pdfReportService;
    private final ExcelReportService excelReportService;

    @GetMapping("/daily/pdf")
    public ResponseEntity<byte[]> downloadDailyPdf() {

        byte[] pdf =
                pdfReportService
                        .generateDailyReport()
                        .toByteArray();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=daily-report.pdf")
                .contentType(
                        MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/daily/excel")
    public ResponseEntity<byte[]> downloadDailyExcel() {

        byte[] excel =
                excelReportService
                        .generateDailyReport()
                        .toByteArray();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=daily-report.xlsx")
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
    }
}