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

    @GetMapping("/my")
    public ResponseEntity<ApiRes<List<ReviewRes>>> getMyReviews() {
        return ResponseEntity.ok(
                ApiRes.<List<ReviewRes>>builder()
                        .success(true)
                        .message("Success")
                        .data(reviewService.getMyReviews())
                        .build()
        );
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiRes<ReviewRes>> update(
            @PathVariable Long id,
            @Valid @RequestBody ReviewReq request) {
        return ResponseEntity.ok(
                ApiRes.<ReviewRes>builder()
                        .success(true)
                        .message("Review updated successfully")
                        .data(reviewService.update(id, request))
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiRes<String>> delete(
            @PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Review deleted successfully")
                        .data(null)
                        .build()
        );
    }
}