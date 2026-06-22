package com.selacafe.order_service.client;

import com.selacafe.order_service.payload.res.MenuRes;
import com.selacafe.order_service.payload.res.PromoRes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class CoreServiceClient {

    private final WebClient webClient;

    public PromoRes getPromoByCode(String code) {
        try {
            return webClient
                    .get()
                    .uri("/api/internal/promos/code/" + code)
                    .retrieve()
                    .bodyToMono(PromoRes.class)
                    .block();
        } catch (Exception e) {
            return null;
        }
    }

    public MenuRes getMenu(Long menuId) {

        return webClient
                .get()
                .uri("/api/internal/menus/" + menuId)
                .retrieve()
                .bodyToMono(MenuRes.class)
                .block();
    }

    public void reduceStock(
            Long menuId,
            Integer quantity) {

        webClient
                .put()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/internal/menus/{id}/reduce-stock")
                        .queryParam("quantity", quantity)
                        .build(menuId))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }
}