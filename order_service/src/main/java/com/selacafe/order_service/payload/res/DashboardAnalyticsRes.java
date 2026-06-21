package com.selacafe.order_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardAnalyticsRes {

    private Long totalOrders;

    private Long completedOrders;

    private Long deliveryOrders;

    private Long dineInOrders;

    private Double totalRevenue;
}