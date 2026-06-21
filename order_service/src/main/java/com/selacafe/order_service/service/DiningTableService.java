package com.selacafe.order_service.service;

import com.selacafe.order_service.payload.req.DiningTableReq;
import com.selacafe.order_service.payload.res.DiningTableRes;

import java.util.List;

public interface DiningTableService {

    DiningTableRes create(
            DiningTableReq request);

    DiningTableRes update(
            Long id,
            DiningTableReq request);

    void delete(Long id);

    DiningTableRes getById(Long id);

    List<DiningTableRes> getAll();
}