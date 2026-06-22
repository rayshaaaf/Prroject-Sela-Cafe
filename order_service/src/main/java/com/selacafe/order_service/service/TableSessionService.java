package com.selacafe.order_service.service;

import com.selacafe.order_service.payload.req.ScanTableReq;
import com.selacafe.order_service.payload.res.TableSessionRes;

import java.util.List;

public interface TableSessionService {
    TableSessionRes scanTable(ScanTableReq request);
    TableSessionRes closeSession(Long sessionId);
    TableSessionRes closeSession(Long sessionId, String role);
    List<TableSessionRes> getAll();
    List<TableSessionRes> getAllActive();
}