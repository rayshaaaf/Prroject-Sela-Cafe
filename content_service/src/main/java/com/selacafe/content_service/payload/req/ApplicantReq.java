package com.selacafe.content_service.payload.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicantReq {

    @NotNull(message = "Career ID is required")
    private Long careerId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    private String coverLetter;

    @NotBlank(message = "CV Filename is required")
    private String cvFilename;
}