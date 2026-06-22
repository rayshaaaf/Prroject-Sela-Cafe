package com.selacafe.core_service.service;

import com.selacafe.core_service.payload.req.PromoReq;
import com.selacafe.core_service.payload.res.PromoRes;

import java.util.List;

public interface PromoService {

    PromoRes create(PromoReq request);
    PromoRes update(Long id,PromoReq request);
    void delete(Long id);
    PromoRes getById(Long id);    
    PromoRes getByCode(String code);
    List<PromoRes> getAll();
}