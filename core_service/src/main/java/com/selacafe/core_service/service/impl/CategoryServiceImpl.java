package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.entity.Category;
import com.selacafe.core_service.exception.BadRequestException;
import com.selacafe.core_service.exception.ResourceNotFoundException;
import com.selacafe.core_service.payload.req.CategoryReq;
import com.selacafe.core_service.payload.res.CategoryRes;
import com.selacafe.core_service.repository.CategoryRepository;
import com.selacafe.core_service.service.CategoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryRes create(CategoryReq request) {

        if (categoryRepository.existsByNameId(request.getNameId())) {
            throw new BadRequestException(
                    "Category already exists");
        }

        Category category = Category.builder()
                .nameId(request.getNameId())
                .nameEn(request.getNameEn())
                .build();

        category = categoryRepository.save(category);

        return mapToResponse(category);
    }

    @Override
    public CategoryRes update(
            Long id,
            CategoryReq request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found"));

        category.setNameId(request.getNameId());
        category.setNameEn(request.getNameEn());

        category = categoryRepository.save(category);

        return mapToResponse(category);
    }

    @Override
    public void delete(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found"));

        categoryRepository.delete(category);
    }

    @Override
    public CategoryRes getById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found"));

        return mapToResponse(category);
    }

    @Override
    public List<CategoryRes> getAll() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CategoryRes mapToResponse(
            Category category) {

        return CategoryRes.builder()
                .id(category.getId())
                .nameId(category.getNameId())
                .nameEn(category.getNameEn())
                .build();
    }
}