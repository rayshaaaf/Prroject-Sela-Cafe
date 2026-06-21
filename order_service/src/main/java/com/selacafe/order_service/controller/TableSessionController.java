package com.selacafe.order_service.controller;

import com.selacafe.order_service.payload.req.ScanTableReq;
import com.selacafe.order_service.payload.res.ApiRes;
import com.selacafe.order_service.payload.res.TableSessionRes;
import com.selacafe.order_service.service.TableSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableSessionController {

        private final TableSessionService tableSessionService;

        @PostMapping("/scan")
        public ResponseEntity<ApiRes<TableSessionRes>> scanTable(
                        @Valid @RequestBody ScanTableReq request) {

                return ResponseEntity.ok(
                                ApiRes.<TableSessionRes>builder()
                                                .success(true)
                                                .message("Table scanned")
                                                .data(
                                                                tableSessionService
                                                                                .scanTable(request))
                                                .build());
        }

        @PutMapping("/sessions/{id}/close")
        public ResponseEntity<ApiRes<TableSessionRes>> closeSession(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                ApiRes.<TableSessionRes>builder()
                                                .success(true)
                                                .message("Session closed")
                                                .data(
                                                                tableSessionService
                                                                                .closeSession(id))
                                                .build());
        }

        @PutMapping("/{id}/close")
        public ResponseEntity<ApiRes<TableSessionRes>> closeSession(
                        @RequestHeader("X-Role") String role,
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                ApiRes.<TableSessionRes>builder()
                                                .success(true)
                                                .message("Session closed successfully")
                                                .data(
                                                                tableSessionService
                                                                                .closeSession(
                                                                                                id,
                                                                                                role))
                                                .build());
        }
}