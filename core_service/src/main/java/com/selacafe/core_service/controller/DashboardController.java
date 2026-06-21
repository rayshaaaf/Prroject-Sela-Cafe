package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.DashboardSummaryRes;
import com.selacafe.core_service.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
    public ResponseEntity<ApiRes<DashboardSummaryRes>> getSummary() {

        return ResponseEntity.ok(
                ApiRes.<DashboardSummaryRes>builder()
                        .success(true)
                        .message("Dashboard summary retrieved successfully")
                        .data(dashboardService.getSummary())
                        .build()
        );
    }
}