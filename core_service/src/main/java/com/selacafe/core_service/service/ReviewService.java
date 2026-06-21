package com.selacafe.core_service.service;

import com.selacafe.core_service.payload.req.ReviewReq;
import com.selacafe.core_service.payload.res.ReviewRes;

import java.util.List;

public interface ReviewService {

    void create(ReviewReq request);

    List<ReviewRes> getByMenu(Long menuId);

    List<ReviewRes> getMyReviews();

    ReviewRes update(Long id, ReviewReq request);

    void delete(Long id);
}