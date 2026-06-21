package com.selacafe.content_service.service;

import com.selacafe.content_service.payload.req.ApplicantReq;
import com.selacafe.content_service.payload.req.ApplyCareerReq;
import com.selacafe.content_service.payload.res.ApplicantRes;


import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface ApplicantService {
    ApplicantRes create(ApplicantReq request);
    List<ApplicantRes> getAll();
    ApplicantRes getById(Long id);
    ApplicantRes update(Long id, ApplicantReq request);
    void delete(Long id);
    ApplicantRes apply(ApplyCareerReq request,MultipartFile cvFile);
    Resource downloadCv(Long applicantId);
}