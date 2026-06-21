package com.selacafe.core_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmailReq {
    @NotBlank
    private String receiverEmailTo;
    private String receiverEmailCc;
    private String receiverEmailBcc;
    @NotBlank
    private String emailSubject;
    @NotBlank
    private String body;
}