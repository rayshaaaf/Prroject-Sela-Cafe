package com.selacafe.core_service.service;

import java.util.List;

import com.selacafe.core_service.payload.req.CategoryReq;
import com.selacafe.core_service.payload.res.CategoryRes;

public interface CategoryService {

    CategoryRes create(CategoryReq request);

    CategoryRes update(Long id, CategoryReq request);

    void delete(Long id);

    CategoryRes getById(Long id);

    List<CategoryRes> getAll();
}
