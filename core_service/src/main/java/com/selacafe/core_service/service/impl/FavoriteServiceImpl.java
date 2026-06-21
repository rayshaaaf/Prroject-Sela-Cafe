package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.entity.Favorite;
import com.selacafe.core_service.entity.Menu;
import com.selacafe.core_service.entity.User;
import com.selacafe.core_service.exception.BadRequestException;
import com.selacafe.core_service.exception.ResourceNotFoundException;
import com.selacafe.core_service.payload.res.FavoriteRes;
import com.selacafe.core_service.repository.FavoriteRepository;
import com.selacafe.core_service.repository.MenuRepository;
import com.selacafe.core_service.service.AuthService;
import com.selacafe.core_service.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final MenuRepository menuRepository;
    private final AuthService authService;

    @Override
    public void addFavorite(Long menuId) {

        User user = authService.getCurrentUser();

        if (favoriteRepository.existsByUserIdAndMenuId(
                user.getId(),
                menuId)) {

            throw new BadRequestException(
                    "Menu already in favorite");
        }

        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Menu not found"));

        Favorite favorite = Favorite.builder()
                .user(user)
                .menu(menu)
                .createdAt(LocalDateTime.now())
                .build();

        favoriteRepository.save(favorite);
    }

    @Override
    public void removeFavorite(Long menuId) {

        User user = authService.getCurrentUser();

        Favorite favorite =
                favoriteRepository.findByUserIdAndMenuId(
                                user.getId(),
                                menuId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Favorite not found"));

        favoriteRepository.delete(favorite);
    }

    @Override
    public List<FavoriteRes> getMyFavorites() {

        User user = authService.getCurrentUser();

        return favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private FavoriteRes mapToResponse(Favorite favorite) {

        return FavoriteRes.builder()
                .id(favorite.getId())
                .menuId(favorite.getMenu().getId())
                .menuNameId(favorite.getMenu().getNameId())
                .menuNameEn(favorite.getMenu().getNameEn())
                .imageUrl(favorite.getMenu().getImageUrl())
                .createdAt(favorite.getCreatedAt())
                .build();
    }
}