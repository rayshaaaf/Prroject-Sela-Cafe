package com.selacafe.core_service.repository;

import com.selacafe.core_service.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository
        extends JpaRepository<Review, Long> {

    List<Review> findByMenuId(Long menuId);

    boolean existsByUserIdAndMenuId(Long userId, Long menuId);
}