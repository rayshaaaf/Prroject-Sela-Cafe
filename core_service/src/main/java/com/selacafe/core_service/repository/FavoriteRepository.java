package com.selacafe.core_service.repository;

import com.selacafe.core_service.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository
        extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserIdAndMenuId(Long userId, Long menuId);

    List<Favorite> findByUserId(Long userId);

    boolean existsByUserIdAndMenuId(Long userId, Long menuId);
}