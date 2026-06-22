package com.selacafe.order_service.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayHeaderFilter gatewayHeaderFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/tables/scan",
                                "/api/tables/get",
                                "/api/tables/getAll",
                                "/api/orders/create",
                                "/api/orders/getById/**",
                                "/api/payments/charge",
                                "/api/payments/order/**",
                                "/api/payments/callback",
                                "/api/payments/*/simulate-success"
                        ).permitAll()
                        .anyRequest()
                        .authenticated()
                )
                .addFilterBefore(
                        gatewayHeaderFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}