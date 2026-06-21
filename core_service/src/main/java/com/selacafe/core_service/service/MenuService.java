package com.selacafe.core_service.service;

import com.selacafe.core_service.payload.req.MenuReq;
import com.selacafe.core_service.payload.res.MenuRes;

import java.util.List;

public interface MenuService {

    MenuRes create(MenuReq request);

    MenuRes update(Long id, MenuReq request);

    void delete(Long id);

    MenuRes getById(Long id);

    List<MenuRes> getAll();
    void reduceStock(Long menuId,Integer quantity);
}