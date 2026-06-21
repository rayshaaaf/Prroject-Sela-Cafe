package com.selacafe.api_gateway.security;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import reactor.core.publisher.Mono;

/**
 * Rate Limit Filter — Per-IP login attempt limiter.
 *
 * Aturan:
 *   - Hanya berlaku untuk endpoint POST /api/auth/login
 *   - Setiap IP mendapat bucket sendiri: maks 5 percobaan / 30 detik
 *   - Jika bucket habis → HTTP 429 Too Many Requests
 *   - Bucket yang tidak diakses > 10 menit akan di-evict otomatis
 */
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    // Bucket per IP address
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Kapan bucket terakhir diakses (untuk eviction)
    private final Map<String, Long> lastAccess = new ConcurrentHashMap<>();

    private static final long EVICT_AFTER_MS = 10 * 60 * 1000L; // 10 menit

    private Bucket getBucketForIp(String ip) {
        evictOldBuckets();
        lastAccess.put(ip, System.currentTimeMillis());
        return buckets.computeIfAbsent(ip, key ->
                Bucket.builder()
                        .addLimit(
                                Bandwidth.builder()
                                        .capacity(5)
                                        .refillGreedy(5, Duration.ofSeconds(30))
                                        .build())
                        .build()
        );
    }

    private void evictOldBuckets() {
        long now = System.currentTimeMillis();
        lastAccess.entrySet().removeIf(entry -> {
            if (now - entry.getValue() > EVICT_AFTER_MS) {
                buckets.remove(entry.getKey());
                return true;
            }
            return false;
        });
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();

        // Hanya terapkan rate limit pada POST /api/auth/login
        if ("POST".equals(method) && path.equals("/api/auth/login")) {

            String ip = getClientIp(exchange);
            Bucket bucket = getBucketForIp(ip);

            if (!bucket.tryConsume(1)) {
                exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

                String body = "{\"success\":false,\"message\":\"Too many login attempts. Please try again in 30 seconds.\",\"data\":null}";
                DataBuffer buffer = exchange.getResponse()
                        .bufferFactory()
                        .wrap(body.getBytes());

                return exchange.getResponse().writeWith(Mono.just(buffer));
            }
        }

        return chain.filter(exchange);
    }

    private String getClientIp(ServerWebExchange exchange) {
        // Cek header X-Forwarded-For terlebih dahulu (jika di balik proxy)
        String forwarded = exchange.getRequest()
                .getHeaders()
                .getFirst("X-Forwarded-For");

        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }

        // Fallback ke remote address
        if (exchange.getRequest().getRemoteAddress() != null) {
            return exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
        }

        return "unknown";
    }

    @Override
    public int getOrder() {
        return -2; // Dieksekusi sebelum JwtAuthGatewayFilter (order -1)
    }
}