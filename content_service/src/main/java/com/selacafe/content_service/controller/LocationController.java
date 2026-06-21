package com.selacafe.content_service.controller;

import com.selacafe.content_service.payload.req.LocationReq;
import com.selacafe.content_service.payload.res.ApiRes;
import com.selacafe.content_service.payload.res.LocationRes;
import com.selacafe.content_service.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
    @PostMapping
    public ResponseEntity<ApiRes<LocationRes>> createLocation(
            @Valid @RequestBody LocationReq request) {
        return ResponseEntity.ok(
                ApiRes.<LocationRes>builder()
                        .success(true)
                        .message("Location created successfully")
                        .data(locationService.create(request))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiRes<List<LocationRes>>> getAllLocations() {
        return ResponseEntity.ok(
                ApiRes.<List<LocationRes>>builder()
                        .success(true)
                        .message("Locations retrieved successfully")
                        .data(locationService.getAll())
                        .build()
        );
    }

    @GetMapping("/open")
    public ResponseEntity<ApiRes<List<LocationRes>>> getOpenLocations() {
        return ResponseEntity.ok(
                ApiRes.<List<LocationRes>>builder()
                        .success(true)
                        .message("Open locations retrieved successfully")
                        .data(locationService.getOpenLocations())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiRes<LocationRes>> getLocationById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiRes.<LocationRes>builder()
                        .success(true)
                        .message("Location retrieved successfully")
                        .data(locationService.getById(id))
                        .build()
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiRes<LocationRes>> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationReq request) {
        return ResponseEntity.ok(
                ApiRes.<LocationRes>builder()
                        .success(true)
                        .message("Location updated successfully")
                        .data(locationService.update(id, request))
                        .build()
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiRes<String>> deleteLocation(
            @PathVariable Long id) {
        locationService.delete(id);
        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Location deleted successfully")
                        .data("Location deleted successfully")
                        .build()
        );
    }
}