package com.selacafe.core_service.client;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import com.selacafe.core_service.payload.res.DashboardAnalyticsRes;
import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.BestSellingMenuRes;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderServiceClient {

    private final WebClient webClient;

    public DashboardAnalyticsRes getAnalytics() {

        ApiRes<DashboardAnalyticsRes> response = webClient
                .get()
                .uri("/api/analytics")
                .retrieve()
                .bodyToMono(
                        new ParameterizedTypeReference<ApiRes<DashboardAnalyticsRes>>() {
                        })
                .block();

        return response.getData();
    }

    public List<BestSellingMenuRes> getBestSellingMenus() {

        ApiRes<List<BestSellingMenuRes>> response = webClient
                .get()
                .uri("/api/analytics/best-selling")
                .retrieve()
                .bodyToMono(
                        new ParameterizedTypeReference<ApiRes<List<BestSellingMenuRes>>>() {
                        })
                .block();

        return response.getData();
    }
}
