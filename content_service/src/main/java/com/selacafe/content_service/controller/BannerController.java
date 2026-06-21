package com.selacafe.content_service.controller;

import com.selacafe.content_service.payload.req.BannerReq;
import com.selacafe.content_service.payload.res.ApiRes;
import com.selacafe.content_service.payload.res.BannerRes;
import com.selacafe.content_service.service.BannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
    @PostMapping
    public ResponseEntity<ApiRes<BannerRes>> createBanner(
            @Valid @RequestBody BannerReq request) {
        return ResponseEntity.ok(
                ApiRes.<BannerRes>builder()
                        .success(true)
                        .message("Banner created successfully")
                        .data(bannerService.create(request))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiRes<List<BannerRes>>> getAllBanners() {
        return ResponseEntity.ok(
                ApiRes.<List<BannerRes>>builder()
                        .success(true)
                        .message("Banners retrieved successfully")
                        .data(bannerService.getAll())
                        .build()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<ApiRes<List<BannerRes>>> getActiveBanners() {
        return ResponseEntity.ok(
                ApiRes.<List<BannerRes>>builder()
                        .success(true)
                        .message("Active banners retrieved successfully")
                        .data(bannerService.getActiveBanners())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiRes<BannerRes>> getBannerById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiRes.<BannerRes>builder()
                        .success(true)
                        .message("Banner retrieved successfully")
                        .data(bannerService.getById(id))
                        .build()
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiRes<BannerRes>> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody BannerReq request) {
        return ResponseEntity.ok(
                ApiRes.<BannerRes>builder()
                        .success(true)
                        .message("Banner updated successfully")
                        .data(bannerService.update(id, request))
                        .build()
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiRes<String>> deleteBanner(
            @PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Banner deleted successfully")
                        .data("Banner deleted successfully")
                        .build()
        );
    }
}