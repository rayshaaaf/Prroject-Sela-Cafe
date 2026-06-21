package com.selacafe.content_service.service;

import com.selacafe.content_service.payload.req.CareerReq;
import com.selacafe.content_service.payload.res.CareerRes;

import java.util.List;

public interface CareerService {

    CareerRes create(CareerReq request);

    List<CareerRes> getAll();

    List<CareerRes> getOpenCareers();

    CareerRes getById(Long id);

    CareerRes update(Long id, CareerReq request);

    void delete(Long id);
}