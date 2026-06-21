package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.entity.Category;
import com.selacafe.core_service.entity.Menu;
import com.selacafe.core_service.exception.ResourceNotFoundException;
import com.selacafe.core_service.payload.req.MenuReq;
import com.selacafe.core_service.payload.res.MenuRes;
import com.selacafe.core_service.repository.CategoryRepository;
import com.selacafe.core_service.repository.MenuRepository;
import com.selacafe.core_service.service.MenuService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

        private final MenuRepository menuRepository;
        private final CategoryRepository categoryRepository;

        @Override
        public MenuRes create(MenuReq request) {

                Category category = categoryRepository.findById(
                                request.getCategoryId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found"));

                Menu menu = Menu.builder()
                                .nameId(request.getNameId())
                                .nameEn(request.getNameEn())
                                .descriptionId(request.getDescriptionId())
                                .descriptionEn(request.getDescriptionEn())
                                .price(request.getPrice())
                                .stock(request.getStock())
                                .isAvailable(true)
                                .category(category)
                                .imageUrl(request.getImageUrl())
                                .createdAt(LocalDateTime.now())
                                .build();

                menu = menuRepository.save(menu);

                return mapToResponse(menu);
        }

        @Override
        public MenuRes update(Long id, MenuReq request) {

                Menu menu = menuRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Menu not found"));

                Category category = categoryRepository.findById(
                                request.getCategoryId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found"));

                menu.setNameId(request.getNameId());
                menu.setNameEn(request.getNameEn());
                menu.setDescriptionId(request.getDescriptionId());
                menu.setDescriptionEn(request.getDescriptionEn());
                menu.setPrice(request.getPrice());
                menu.setStock(request.getStock());
                menu.setCategory(category);
                menu.setImageUrl(request.getImageUrl());

                menu.setIsAvailable(request.getStock() > 0);

                menu = menuRepository.save(menu);

                return mapToResponse(menu);
        }

        @Override
        public void delete(Long id) {

                Menu menu = menuRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Menu not found"));

                menuRepository.delete(menu);
        }

        @Override
        public MenuRes getById(Long id) {

                Menu menu = menuRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Menu not found"));

                return mapToResponse(menu);
        }

        @Override
        public List<MenuRes> getAll() {

                return menuRepository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        private MenuRes mapToResponse(Menu menu) {

                return MenuRes.builder()
                                .id(menu.getId())
                                .nameId(menu.getNameId())
                                .nameEn(menu.getNameEn())
                                .descriptionId(menu.getDescriptionId())
                                .descriptionEn(menu.getDescriptionEn())
                                .price(menu.getPrice())
                                .stock(menu.getStock())
                                .isAvailable(menu.getIsAvailable())
                                .categoryId(menu.getCategory().getId())
                                .categoryName(menu.getCategory().getNameId())
                                .imageUrl(menu.getImageUrl())
                                .build();
        }

        @Override
        public void reduceStock(
                        Long menuId,
                        Integer quantity) {

                Menu menu = menuRepository.findById(menuId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Menu not found"));

                if (menu.getStock() < quantity) {

                        throw new RuntimeException(
                                        "Insufficient stock");
                }

                menu.setStock(
                                menu.getStock() - quantity);

                if (menu.getStock() <= 0) {

                        menu.setStock(0);
                        menu.setIsAvailable(false);
                }

                menuRepository.save(menu);
        }
}