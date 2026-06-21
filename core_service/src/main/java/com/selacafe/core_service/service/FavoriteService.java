package com.selacafe.core_service.service;

import com.selacafe.core_service.payload.res.FavoriteRes;

import java.util.List;

public interface FavoriteService {
    void addFavorite(Long menuId);
    void removeFavorite(Long menuId);
    List<FavoriteRes> getMyFavorites();
}