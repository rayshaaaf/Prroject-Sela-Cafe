package com.selacafe.core_service.payload.res;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsRes {
    private Long totalOrders;
    private Long completedOrders;
    private Long deliveryOrders;
    private Long dineInOrders;
    private Double totalRevenue;
}