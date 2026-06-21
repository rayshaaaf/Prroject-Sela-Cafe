package com.selacafe.content_service.payload.res;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApplicantRes {

    private Long id;

    private Long careerId;

    private String careerName;

    private String fullName;

    private String email;

    private String phone;

    private String address;

    private String cvFilename;

    private String coverLetter;

    private LocalDateTime appliedAt;
}