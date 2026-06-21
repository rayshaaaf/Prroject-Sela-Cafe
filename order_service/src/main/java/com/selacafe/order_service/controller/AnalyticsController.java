package com.selacafe.order_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.selacafe.order_service.payload.res.ApiRes;
import com.selacafe.order_service.payload.res.BestSellingMenuRes;
import com.selacafe.order_service.payload.res.DashboardAnalyticsRes;
import com.selacafe.order_service.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiRes<DashboardAnalyticsRes>> getAnalytics() {

        return ResponseEntity.ok(
                ApiRes.<DashboardAnalyticsRes>builder()
                        .success(true)
                        .message(
                                "Analytics retrieved successfully")
                        .data(
                                orderService.getAnalytics())
                        .build());
    }

    @GetMapping("/best-selling")
    public ResponseEntity<ApiRes<List<BestSellingMenuRes>>> getBestSellingMenus() {

        return ResponseEntity.ok(
                ApiRes.<List<BestSellingMenuRes>>builder()
                        .success(true)
                        .message(
                                "Best selling menus retrieved successfully")
                        .data(
                                orderService.getBestSellingMenus())
                        .build());
    }
}