package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.req.ReviewReq;
import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.ReviewRes;
import com.selacafe.core_service.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/create")
    public ResponseEntity<ApiRes<String>> create(
            @Valid @RequestBody ReviewReq request) {

        reviewService.create(request);

        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Review added")
                        .data(null)
                        .build()
        );
    }

    @GetMapping("/menu/{menuId}")
    public ResponseEntity<ApiRes<List<ReviewRes>>> getByMenu(
            @PathVariable Long menuId) {

        return ResponseEntity.ok(
                ApiRes.<List<ReviewRes>>builder()
                        .success(true)
                        .message("Success")
                        .data(reviewService.getByMenu(menuId))
                        .build()
        );
    }
}