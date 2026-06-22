package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.service.EmailService;
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
    private final EmailService emailService;

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

    @PostMapping("/send-daily-email")
    public ResponseEntity<ApiRes<String>> sendDailyEmail() {
        try {
            java.io.ByteArrayOutputStream pdf = pdfReportService.generateDailyReport();
            emailService.sendDailyReportEmail(pdf);
            return ResponseEntity.ok(
                    ApiRes.<String>builder()
                            .success(true)
                            .message("Daily report email triggered and sent successfully to Owner")
                            .data(null)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    ApiRes.<String>builder()
                            .success(false)
                            .message("Failed to send daily report email: " + e.getMessage())
                            .data(null)
                            .build()
            );
        }
    }
}