package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.payload.req.EmailReq;
import com.selacafe.core_service.service.EmailService;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import java.io.ByteArrayOutputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.owner.email}")
    private String ownerEmail;

    @Override
    public void sendEmail(EmailReq request) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(
                request.getReceiverEmailTo());

        if (request.getReceiverEmailCc() != null
                && !request.getReceiverEmailCc().isBlank()) {

            message.setCc(
                    request.getReceiverEmailCc());
        }

        if (request.getReceiverEmailBcc() != null
                && !request.getReceiverEmailBcc().isBlank()) {

            message.setBcc(
                    request.getReceiverEmailBcc());
        }

        message.setSubject(
                request.getEmailSubject());

        message.setText(
                request.getBody());

        mailSender.send(message);
    }

    @Override
    public void sendDailyReportEmail(
            ByteArrayOutputStream pdfFile) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true);

            helper.setTo(ownerEmail);

            helper.setSubject(
                    "Sela Cafe Daily Business Report");

            helper.setText(
                    """
                    Dear Owner,

                    Attached is today's business report.

                    This report contains:

                    - Revenue Summary
                    - Order Statistics
                    - Business Overview
                    - Best Selling Menus

                    Regards,
                    Sela Cafe Management System
                    """
            );

            helper.addAttachment(
                    "daily-report.pdf",
                    new ByteArrayResource(
                            pdfFile.toByteArray()));

            mailSender.send(message);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to send report email",
                    e);
        }
    }
}