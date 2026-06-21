package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.req.CategoryReq;
import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.CategoryRes;
import com.selacafe.core_service.service.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping("/create")
    public ResponseEntity<ApiRes<CategoryRes>> create(
            @Valid @RequestBody CategoryReq request) {

        CategoryRes response =
                categoryService.create(request);

        return ResponseEntity.ok(
                ApiRes.<CategoryRes>builder()
                        .success(true)
                        .message("Category created successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiRes<List<CategoryRes>>> getAll() {

        List<CategoryRes> response =
                categoryService.getAll();

        return ResponseEntity.ok(
                ApiRes.<List<CategoryRes>>builder()
                        .success(true)
                        .message("Categories retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<ApiRes<CategoryRes>> getById(
            @PathVariable Long id) {

        CategoryRes response =
                categoryService.getById(id);

        return ResponseEntity.ok(
                ApiRes.<CategoryRes>builder()
                        .success(true)
                        .message("Category retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiRes<CategoryRes>> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryReq request) {

        CategoryRes response =
                categoryService.update(id, request);

        return ResponseEntity.ok(
                ApiRes.<CategoryRes>builder()
                        .success(true)
                        .message("Category updated successfully")
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiRes<String>> delete(
            @PathVariable Long id) {

        categoryService.delete(id);

        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Category deleted successfully")
                        .data(null)
                        .build()
        );
    }
}