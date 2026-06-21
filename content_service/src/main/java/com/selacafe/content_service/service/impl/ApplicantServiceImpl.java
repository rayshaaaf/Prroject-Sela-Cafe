package com.selacafe.content_service.service.impl;

import com.selacafe.content_service.entity.Applicant;
import com.selacafe.content_service.entity.Career;
import com.selacafe.content_service.exception.ResourceNotFoundException;
import com.selacafe.content_service.payload.req.ApplicantReq;
import com.selacafe.content_service.payload.req.ApplyCareerReq;
import com.selacafe.content_service.payload.res.ApplicantRes;
import com.selacafe.content_service.repository.ApplicantRepository;
import com.selacafe.content_service.repository.CareerRepository;
import com.selacafe.content_service.service.ApplicantService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicantServiceImpl implements ApplicantService {

        @Value("${file.upload-dir}")
        private String uploadDir;

        private final ApplicantRepository applicantRepository;
        private final CareerRepository careerRepository;

        private ApplicantRes mapToResponse(Applicant applicant) {

                return ApplicantRes.builder()
                                .id(applicant.getId())
                                .careerId(applicant.getCareer().getId())
                                .careerName(applicant.getCareer().getPositionId())
                                .fullName(applicant.getFullName())
                                .email(applicant.getEmail())
                                .phone(applicant.getPhone())
                                .address(applicant.getAddress())
                                .cvFilename(applicant.getCvFilename())
                                .coverLetter(applicant.getCoverLetter())
                                .appliedAt(applicant.getAppliedAt())
                                .build();
        }

        @Override
        public ApplicantRes create(ApplicantReq request) {

                Career career = careerRepository.findById(
                                request.getCareerId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Career not found"));

                Applicant applicant = Applicant.builder()
                                .career(career)
                                .fullName(request.getFullName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .address(request.getAddress())
                                .cvFilename(request.getCvFilename())
                                .coverLetter(request.getCoverLetter())
                                .build();

                Applicant savedApplicant = applicantRepository.save(applicant);

                return mapToResponse(savedApplicant);
        }

        @Override
        public List<ApplicantRes> getAll() {

                return applicantRepository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public ApplicantRes getById(Long id) {

                Applicant applicant = applicantRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Applicant not found"));

                return mapToResponse(applicant);
        }

        @Override
        public ApplicantRes update(
                        Long id,
                        ApplicantReq request) {

                Applicant applicant = applicantRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Applicant not found"));

                Career career = careerRepository.findById(
                                request.getCareerId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Career not found"));

                applicant.setCareer(career);
                applicant.setFullName(request.getFullName());
                applicant.setEmail(request.getEmail());
                applicant.setPhone(request.getPhone());
                applicant.setAddress(request.getAddress());
                applicant.setCvFilename(request.getCvFilename());
                applicant.setCoverLetter(request.getCoverLetter());

                Applicant updatedApplicant = applicantRepository.save(applicant);

                return mapToResponse(updatedApplicant);
        }

        @Override
        public void delete(Long id) {

                Applicant applicant = applicantRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Applicant not found"));

                applicantRepository.delete(applicant);
        }

        @Override
        public ApplicantRes apply(
                        ApplyCareerReq request,
                        MultipartFile cvFile) {

                try {

                        Career career = careerRepository.findById(
                                        request.getCareerId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Career not found"));

                        String fileName = System.currentTimeMillis()
                                        + "_"
                                        + cvFile.getOriginalFilename();

                        Path uploadPath = Paths.get(uploadDir);

                        Files.createDirectories(uploadPath);

                        Files.copy(
                                        cvFile.getInputStream(),
                                        uploadPath.resolve(fileName),
                                        StandardCopyOption.REPLACE_EXISTING);

                        Applicant applicant = Applicant.builder()
                                        .career(career)
                                        .fullName(request.getFullName())
                                        .email(request.getEmail())
                                        .phone(request.getPhone())
                                        .address(request.getAddress())
                                        .coverLetter(request.getCoverLetter())
                                        .cvFilename(fileName)
                                        .build();

                        Applicant savedApplicant = applicantRepository.save(applicant);

                        return mapToResponse(savedApplicant);

                } catch (Exception e) {

                        throw new RuntimeException(
                                        "Failed to upload CV");
                }
        }

        @Override
        public Resource downloadCv(Long applicantId) {

                try {

                        Applicant applicant = applicantRepository.findById(applicantId)
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Applicant not found"));

                        Path filePath = Paths.get(uploadDir)
                                        .resolve(applicant.getCvFilename())
                                        .normalize();

                        org.springframework.core.io.Resource resource = new UrlResource(filePath.toUri());

                        if (!resource.exists()) {

                                throw new RuntimeException(
                                                "CV file not found");
                        }

                        return resource;

                } catch (MalformedURLException e) {

                        throw new RuntimeException(
                                        "Failed to download CV");
                }
        }
}
