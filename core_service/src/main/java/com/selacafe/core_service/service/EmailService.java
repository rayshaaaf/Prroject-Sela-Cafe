package com.selacafe.core_service.service;

import java.io.ByteArrayOutputStream;

import com.selacafe.core_service.payload.req.EmailReq;

public interface EmailService {

    void sendEmail(EmailReq request);
    void sendDailyReportEmail(ByteArrayOutputStream pdfFile);

}