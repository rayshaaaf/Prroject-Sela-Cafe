package com.selacafe.content_service.controller;

import com.selacafe.content_service.payload.req.ApplicantReq;
import com.selacafe.content_service.payload.req.ApplyCareerReq;
import com.selacafe.content_service.payload.res.ApiRes;
import com.selacafe.content_service.payload.res.ApplicantRes;
import com.selacafe.content_service.service.ApplicantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applicants")
@RequiredArgsConstructor
public class ApplicantController {

        private final ApplicantService applicantService;

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @PostMapping
        public ResponseEntity<ApiRes<ApplicantRes>> createApplicant(
                        @Valid @RequestBody ApplicantReq request) {
                return ResponseEntity.ok(
                                ApiRes.<ApplicantRes>builder()
                                                .success(true)
                                                .message("Applicant created successfully")
                                                .data(applicantService.create(request))
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @GetMapping
        public ResponseEntity<ApiRes<List<ApplicantRes>>> getAllApplicants() {
                return ResponseEntity.ok(
                                ApiRes.<List<ApplicantRes>>builder()
                                                .success(true)
                                                .message("Applicants retrieved successfully")
                                                .data(applicantService.getAll())
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @GetMapping("/{id}")
        public ResponseEntity<ApiRes<ApplicantRes>> getApplicantById(
                        @PathVariable Long id) {
                return ResponseEntity.ok(
                                ApiRes.<ApplicantRes>builder()
                                                .success(true)
                                                .message("Applicant retrieved successfully")
                                                .data(applicantService.getById(id))
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @PutMapping("/{id}")
        public ResponseEntity<ApiRes<ApplicantRes>> updateApplicant(
                        @PathVariable Long id,
                        @Valid @RequestBody ApplicantReq request) {
                return ResponseEntity.ok(
                                ApiRes.<ApplicantRes>builder()
                                                .success(true)
                                                .message("Applicant updated successfully")
                                                .data(applicantService.update(id, request))
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiRes<String>> deleteApplicant(
                        @PathVariable Long id) {
                applicantService.delete(id);
                return ResponseEntity.ok(
                                ApiRes.<String>builder()
                                                .success(true)
                                                .message("Applicant deleted successfully")
                                                .data("Applicant deleted successfully")
                                                .build());
        }

        @PostMapping("/apply")
        public ResponseEntity<ApiRes<ApplicantRes>> applyCareer(
                        @RequestParam Long careerId,
                        @RequestParam String fullName,
                        @RequestParam String email,
                        @RequestParam String phone,
                        @RequestParam String address,
                        @RequestParam String coverLetter,
                        @RequestParam MultipartFile cvFile) {

                ApplyCareerReq request = new ApplyCareerReq();
                request.setCareerId(careerId);
                request.setFullName(fullName);
                request.setEmail(email);
                request.setPhone(phone);
                request.setAddress(address);
                request.setCoverLetter(coverLetter);

                return ResponseEntity.ok(
                                ApiRes.<ApplicantRes>builder()
                                                .success(true)
                                                .message("Application submitted successfully")
                                                .data(applicantService.apply(request, cvFile))
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @GetMapping("/{id}/cv")
        public ResponseEntity<Resource> downloadCv(
                        @PathVariable Long id) {
                Resource resource = applicantService.downloadCv(id);
                return ResponseEntity.ok()
                                .header(
                                                "Content-Disposition",
                                                "attachment; filename=\"" +
                                                                resource.getFilename() +
                                                                "\"")
                                .body(resource);
        }
}