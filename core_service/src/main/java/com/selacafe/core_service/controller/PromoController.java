package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.req.PromoReq;
import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.PromoRes;
import com.selacafe.core_service.service.PromoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/promos")
@RequiredArgsConstructor
public class PromoController {

    private final PromoService promoService;

    @PostMapping("/create")
    public ResponseEntity<ApiRes<PromoRes>> create(@Valid @RequestBody PromoReq request) {
        PromoRes response = promoService.create(request);
        return ResponseEntity.ok(
                ApiRes.<PromoRes>builder()
                        .success(true)
                        .message("Promo created successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiRes<List<PromoRes>>> getAll() {
        List<PromoRes> response = promoService.getAll();
        return ResponseEntity.ok(
                ApiRes.<List<PromoRes>>builder()
                        .success(true)
                        .message("Promos retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<ApiRes<PromoRes>> getById(@PathVariable Long id) {
        PromoRes response = promoService.getById(id);
        return ResponseEntity.ok(
                ApiRes.<PromoRes>builder()
                        .success(true)
                        .message("Promo retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiRes<PromoRes>> update(@PathVariable Long id, @Valid @RequestBody PromoReq request) {
        PromoRes response =promoService.update(id, request);
        return ResponseEntity.ok(
                ApiRes.<PromoRes>builder()
                        .success(true)
                        .message("Promo updated successfully")
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiRes<String>> delete(@PathVariable Long id) {
        promoService.delete(id);
        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Promo deleted successfully")
                        .data(null)
                        .build()
        );
    }
}