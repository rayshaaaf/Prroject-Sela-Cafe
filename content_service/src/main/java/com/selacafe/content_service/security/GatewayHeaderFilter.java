package com.selacafe.content_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class GatewayHeaderFilter extends OncePerRequestFilter {

    private static final String GATEWAY_TOKEN_HEADER = "X-Gateway-Token";
    private static final String GATEWAY_TOKEN_VALUE = "SelaCafeGatewaySecret2026";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String gatewayToken = request.getHeader(GATEWAY_TOKEN_HEADER);

        if (gatewayToken == null || !gatewayToken.equals(GATEWAY_TOKEN_VALUE)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Forbidden: Direct access not allowed\",\"data\":null}");
            return;
        }

        String role = request.getHeader("X-Role");
        String email = request.getHeader("X-Email");

        if (role != null && !role.isBlank()) {
            List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role));

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(email != null ? email : "anonymous", null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
