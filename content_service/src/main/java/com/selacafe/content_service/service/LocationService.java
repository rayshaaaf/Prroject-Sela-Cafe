package com.selacafe.content_service.service;

import com.selacafe.content_service.payload.req.LocationReq;
import com.selacafe.content_service.payload.res.LocationRes;

import java.util.List;

public interface LocationService {

    LocationRes create(LocationReq request);

    List<LocationRes> getAll();

    List<LocationRes> getOpenLocations();

    LocationRes getById(Long id);

    LocationRes update(Long id, LocationReq request);

    void delete(Long id);
}