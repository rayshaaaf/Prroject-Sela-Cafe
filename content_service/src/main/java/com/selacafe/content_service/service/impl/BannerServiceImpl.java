package com.selacafe.content_service.service.impl;

import com.selacafe.content_service.entity.Banner;
import com.selacafe.content_service.exception.ResourceNotFoundException;
import com.selacafe.content_service.payload.req.BannerReq;
import com.selacafe.content_service.payload.res.BannerRes;
import com.selacafe.content_service.repository.BannerRepository;
import com.selacafe.content_service.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    private BannerRes mapToResponse(Banner banner) {
        return BannerRes.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .imageUrl(banner.getImageUrl())
                .isActive(banner.getIsActive())
                .build();
    }

    @Override
public BannerRes create(BannerReq request){
        Banner banner = Banner.builder()
                .title(request.getTitle())
                .imageUrl(request.getImageUrl())
                .isActive(
                        request.getIsActive() == null
                                ? true
                                : request.getIsActive()
                )
                .build();

        Banner savedBanner = bannerRepository.save(banner);

        return mapToResponse(savedBanner);
    }

    @Override
    public List<BannerRes> getAll() {

        return bannerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BannerRes> getActiveBanners() {

        return bannerRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BannerRes getById(Long id) {

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Banner not found with id: " + id));

        return mapToResponse(banner);
    }

    @Override
public BannerRes update(Long id, BannerReq request){
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Banner not found with id: " + id));

        banner.setTitle(request.getTitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setIsActive(request.getIsActive());

        Banner updatedBanner = bannerRepository.save(banner);

        return mapToResponse(updatedBanner);
    }

    @Override
    public void delete(Long id) {

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Banner not found with id: " + id));

        bannerRepository.delete(banner);
    }
}