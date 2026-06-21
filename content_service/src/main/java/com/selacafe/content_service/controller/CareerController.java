package com.selacafe.content_service.controller;

import com.selacafe.content_service.payload.req.CareerReq;
import com.selacafe.content_service.payload.res.ApiRes;
import com.selacafe.content_service.payload.res.CareerRes;
import com.selacafe.content_service.service.CareerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/careers")
@RequiredArgsConstructor
public class CareerController {

        private final CareerService careerService;

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @PostMapping
        public ResponseEntity<ApiRes<CareerRes>> createCareer(
                        @Valid @RequestBody CareerReq request) {
                return ResponseEntity.ok(
                                ApiRes.<CareerRes>builder()
                                                .success(true)
                                                .message("Career created successfully")
                                                .data(careerService.create(request))
                                                .build());
        }

        @GetMapping
        public ResponseEntity<ApiRes<List<CareerRes>>> getAllCareers() {
                return ResponseEntity.ok(
                                ApiRes.<List<CareerRes>>builder()
                                                .success(true)
                                                .message("Careers retrieved successfully")
                                                .data(careerService.getAll())
                                                .build());
        }

        @GetMapping("/open")
        public ResponseEntity<ApiRes<List<CareerRes>>> getOpenCareers() {
                return ResponseEntity.ok(
                                ApiRes.<List<CareerRes>>builder()
                                                .success(true)
                                                .message("Open careers retrieved successfully")
                                                .data(careerService.getOpenCareers())
                                                .build());
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiRes<CareerRes>> getCareerById(
                        @PathVariable Long id) {
                return ResponseEntity.ok(
                                ApiRes.<CareerRes>builder()
                                                .success(true)
                                                .message("Career retrieved successfully")
                                                .data(careerService.getById(id))
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @PutMapping("/{id}")
        public ResponseEntity<ApiRes<CareerRes>> updateCareer(
                        @PathVariable Long id,
                        @Valid @RequestBody CareerReq request) {
                return ResponseEntity.ok(
                                ApiRes.<CareerRes>builder()
                                                .success(true)
                                                .message("Career updated successfully")
                                                .data(careerService.update(id, request))
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiRes<String>> deleteCareer(
                        @PathVariable Long id) {
                careerService.delete(id);
                return ResponseEntity.ok(
                                ApiRes.<String>builder()
                                                .success(true)
                                                .message("Career deleted successfully")
                                                .data("Career deleted successfully")
                                                .build());
        }
}