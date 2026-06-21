package com.selacafe.content_service.service;

import com.selacafe.content_service.payload.req.BannerReq;
import com.selacafe.content_service.payload.res.BannerRes;

import java.util.List;

public interface BannerService {
    BannerRes create(BannerReq request);
    BannerRes update(Long id, BannerReq request);
    List<BannerRes> getAll();
    List<BannerRes> getActiveBanners();
    BannerRes getById(Long id);
    void delete(Long id);
}