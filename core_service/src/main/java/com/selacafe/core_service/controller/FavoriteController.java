package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.FavoriteRes;
import com.selacafe.core_service.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/add/{menuId}")
    public ResponseEntity<ApiRes<String>> addFavorite(
            @PathVariable Long menuId) {

        favoriteService.addFavorite(menuId);

        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Favorite added")
                        .data(null)
                        .build()
        );
    }

    @DeleteMapping("/removed/{menuId}")
    public ResponseEntity<ApiRes<String>> removeFavorite(
            @PathVariable Long menuId) {

        favoriteService.removeFavorite(menuId);

        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Favorite removed")
                        .data(null)
                        .build()
        );
    }

    @GetMapping("/my")
    public ResponseEntity<ApiRes<List<FavoriteRes>>> getMyFavorites() {

        return ResponseEntity.ok(
                ApiRes.<List<FavoriteRes>>builder()
                        .success(true)
                        .message("Success")
                        .data(favoriteService.getMyFavorites())
                        .build()
        );
    }
}