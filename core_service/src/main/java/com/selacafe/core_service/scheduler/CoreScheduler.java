package com.selacafe.core_service.scheduler;

import java.io.ByteArrayOutputStream;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.selacafe.core_service.service.EmailService;
import com.selacafe.core_service.service.PdfReportService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CoreScheduler {

    private final PdfReportService pdfReportService;
    private final EmailService emailService;

    @Scheduled(cron = "0 56 15 * * *")
    public void sendDailyReport() {

        ByteArrayOutputStream pdf = pdfReportService.generateDailyReport();

        emailService.sendDailyReportEmail(pdf);

        System.out.println(
                "Daily report sent successfully");
    }
}