package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.req.MenuReq;
import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.MenuRes;
import com.selacafe.core_service.service.MenuService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @PostMapping("/create")
    public ResponseEntity<ApiRes<MenuRes>> create(
            @Valid @RequestBody MenuReq request) {

        MenuRes response = menuService.create(request);

        return ResponseEntity.ok(
                ApiRes.<MenuRes>builder()
                        .success(true)
                        .message("Menu created successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiRes<List<MenuRes>>> getAll() {

        List<MenuRes> response = menuService.getAll();

        return ResponseEntity.ok(
                ApiRes.<List<MenuRes>>builder()
                        .success(true)
                        .message("Menus retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<ApiRes<MenuRes>> getById(
            @PathVariable Long id) {

        MenuRes response = menuService.getById(id);

        return ResponseEntity.ok(
                ApiRes.<MenuRes>builder()
                        .success(true)
                        .message("Menu retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiRes<MenuRes>> update(
            @PathVariable Long id,
            @Valid @RequestBody MenuReq request) {

        MenuRes response =
                menuService.update(id, request);

        return ResponseEntity.ok(
                ApiRes.<MenuRes>builder()
                        .success(true)
                        .message("Menu updated successfully")
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiRes<String>> delete(
            @PathVariable Long id) {

        menuService.delete(id);

        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Menu deleted successfully")
                        .data(null)
                        .build()
        );
    }
}