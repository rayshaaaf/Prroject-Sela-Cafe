package com.selacafe.api_gateway.security;

import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class JwtAuthGatewayFilter
        implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain) {

        String path =
                exchange.getRequest()
                        .getURI()
                        .getPath();
        String method =
                exchange.getRequest()
                        .getMethod()
                        .name();

        // Strip client-injected user headers and inject gateway token
        ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate()
                .headers(httpHeaders -> {
                    httpHeaders.remove("X-User-Id");
                    httpHeaders.remove("X-Role");
                    httpHeaders.remove("X-Email");
                })
                .header("X-Gateway-Token", "SelaCafeGatewaySecret2026");

        String authHeader =
                exchange.getRequest()
                        .getHeaders()
                        .getFirst(HttpHeaders.AUTHORIZATION);

        boolean hasToken = authHeader != null && authHeader.startsWith("Bearer ");
        boolean isPublic = isPublicPath(path, method);

        if (!hasToken) {
            if (isPublic) {
                return chain.filter(
                        exchange.mutate()
                                .request(requestBuilder.build())
                                .build());
            } else {
                exchange.getResponse()
                        .setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            if (isPublic) {
                return chain.filter(
                        exchange.mutate()
                                .request(requestBuilder.build())
                                .build());
            } else {
                exchange.getResponse()
                        .setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        }

        Long userId =
                jwtUtil.extractUserId(token);

        String role =
                jwtUtil.extractRole(token);

        String email =
                jwtUtil.extractEmail(token);

        requestBuilder
                .header("X-User-Id", String.valueOf(userId))
                .header("X-Role", role)
                .header("X-Email", email);

        return chain.filter(
                exchange.mutate()
                        .request(requestBuilder.build())
                        .build());
    }

    private boolean isPublicPath(String path, String method) {
        if (path.startsWith("/api/auth")) {
            return true;
        }
        if ("GET".equalsIgnoreCase(method)) {
            if (path.equals("/api/menus/getAll") || path.startsWith("/api/menus/getById/")) {
                return true;
            }
            if (path.equals("/api/categories/getAll") || path.startsWith("/api/categories/getById/")) {
                return true;
            }
            if (path.equals("/api/promos/getAll") || path.startsWith("/api/promos/getById/") || path.equals("/api/promos/active")) {
                return true;
            }
            if (path.startsWith("/api/locations") || path.startsWith("/api/banners") || path.startsWith("/api/careers")) {
                return true;
            }
            if (path.startsWith("/api/reviews/menu/")) {
                return true;
            }
            if (path.startsWith("/api/orders/getById/")) {
                return true;
            }
        }
        if (path.equals("/api/applicants/apply")) {
            return true;
        }
        if (path.equals("/api/tables/scan")) {
            return true;
        }
        if (path.equals("/api/orders/create")) {
            return true;
        }
        if (path.equals("/api/payments/callback") || (path.startsWith("/api/payments/") && path.endsWith("/simulate-success"))) {
            return true;
        }
        return false;
    }

    @Override
    public int getOrder() {
        return -1;
    }
}