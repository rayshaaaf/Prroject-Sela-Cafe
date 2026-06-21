package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.res.MenuRes;
import com.selacafe.core_service.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/menus")
@RequiredArgsConstructor
public class InternalMenuController {

    private final MenuService menuService;

    @GetMapping("/{id}")
    public MenuRes getMenu(
            @PathVariable Long id) {

        return menuService.getById(id);
    }

    @PutMapping("/{id}/reduce-stock")
    public void reduceStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {

        menuService.reduceStock(
                id,
                quantity);
    }
}