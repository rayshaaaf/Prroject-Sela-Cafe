package com.selacafe.content_service.payload.req;

import lombok.Data;

@Data
public class ApplyCareerReq {

    private Long careerId;

    private String fullName;

    private String email;

    private String phone;

    private String address;

    private String coverLetter;
}