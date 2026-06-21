package com.selacafe.core_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryRes {

    private Long totalUsers;

    private Long activeUsers;

    private Long inactiveUsers;

    private Long totalMenus;

    private Long totalCategories;

    private Long totalFavorites;

    private Long totalReviews;
}