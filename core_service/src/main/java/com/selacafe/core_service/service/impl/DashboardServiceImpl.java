package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.payload.res.DashboardSummaryRes;
import com.selacafe.core_service.repository.*;
import com.selacafe.core_service.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public DashboardSummaryRes getSummary() {

        Long totalUsers = userRepository.count();

        Long activeUsers = userRepository.findAll()
                .stream()
                .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                .count();

        Long inactiveUsers = totalUsers - activeUsers;

        Long totalMenus = menuRepository.count();

        Long totalCategories = categoryRepository.count();

        Long totalFavorites = favoriteRepository.count();

        Long totalReviews = reviewRepository.count();

        return DashboardSummaryRes.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .totalMenus(totalMenus)
                .totalCategories(totalCategories)
                .totalFavorites(totalFavorites)
                .totalReviews(totalReviews)
                .build();
    }
}