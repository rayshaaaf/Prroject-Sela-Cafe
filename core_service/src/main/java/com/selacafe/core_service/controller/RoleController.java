package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.RoleRes;
import com.selacafe.core_service.service.RoleService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
    public ResponseEntity<ApiRes<List<RoleRes>>> getAllRoles() {

        return ResponseEntity.ok(
                ApiRes.<List<RoleRes>>builder()
                        .success(true)
                        .message("Roles retrieved successfully")
                        .data(roleService.getAllRoles())
                        .build()
        );
    }
}