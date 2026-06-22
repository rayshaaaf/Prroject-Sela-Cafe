package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.res.PromoRes;
import com.selacafe.core_service.service.PromoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/promos")
@RequiredArgsConstructor
public class InternalPromoController {

    private final PromoService promoService;

    @GetMapping("/code/{code}")
    public PromoRes getPromoByCode(@PathVariable String code) {
        return promoService.getByCode(code);
    }
}
