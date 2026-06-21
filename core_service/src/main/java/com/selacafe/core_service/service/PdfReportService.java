package com.selacafe.core_service.service;

import java.io.ByteArrayOutputStream;

public interface PdfReportService {

    ByteArrayOutputStream generateDailyReport();
    ByteArrayOutputStream generateWeeklyReport();
    ByteArrayOutputStream generateMonthlyReport();

}