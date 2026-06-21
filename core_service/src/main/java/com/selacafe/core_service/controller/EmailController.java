package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.req.EmailReq;
import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<ApiRes<String>> sendEmail(@Valid @RequestBody EmailReq request) {
        emailService.sendEmail(request);
        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Email sent successfully")
                        .data(null)
                        .build()
        );
    }
}