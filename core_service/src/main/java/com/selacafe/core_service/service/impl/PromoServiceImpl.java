package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.entity.Promo;
import com.selacafe.core_service.exception.BadRequestException;
import com.selacafe.core_service.exception.ResourceNotFoundException;
import com.selacafe.core_service.payload.req.PromoReq;
import com.selacafe.core_service.payload.res.PromoRes;
import com.selacafe.core_service.repository.PromoRepository;
import com.selacafe.core_service.service.PromoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromoServiceImpl implements PromoService {

    private final PromoRepository promoRepository;

    @Override
    public PromoRes create(PromoReq request) {
        validateDiscount(request.getDiscountPct());
        Promo promo = Promo.builder()
                .titleId(request.getTitleId())
                .titleEn(request.getTitleEn())
                .descriptionId(request.getDescriptionId())
                .descriptionEn(request.getDescriptionEn())
                .promoCode(request.getPromoCode())
                .discountPct(request.getDiscountPct())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .imageUrl(request.getImageUrl())
                .isActive(
                        request.getIsActive() == null
                                ? true
                                : request.getIsActive())
                .build();
        promo = promoRepository.save(promo);
        return mapToResponse(promo);
    }

    @Override
    public PromoRes update(Long id,PromoReq request) {
        Promo promo = promoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Promo not found"));
        validateDiscount(request.getDiscountPct());
        promo.setTitleId(request.getTitleId());
        promo.setTitleEn(request.getTitleEn());
        promo.setDescriptionId(request.getDescriptionId());
        promo.setDescriptionEn(request.getDescriptionEn());
        promo.setPromoCode(request.getPromoCode());
        promo.setDiscountPct(request.getDiscountPct());
        promo.setStartDate(request.getStartDate());
        promo.setEndDate(request.getEndDate());
        promo.setStartTime(request.getStartTime());
        promo.setEndTime(request.getEndTime());
        promo.setImageUrl(request.getImageUrl());
        promo.setIsActive(request.getIsActive());

        promo = promoRepository.save(promo);
        return mapToResponse(promo);
    }

    @Override
    public void delete(Long id) {
        Promo promo = promoRepository.findById(id).orElseThrow(() ->new ResourceNotFoundException("Promo not found"));
        promoRepository.delete(promo);
    }

    @Override
    public PromoRes getById(Long id) {
        Promo promo = promoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Promo not found"));
        return mapToResponse(promo);
    }

    @Override
    public List<PromoRes> getAll() {
        return promoRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void validateDiscount(
            Integer discountPct) {

        if (discountPct == null || discountPct <= 0 || discountPct > 100) {
            throw new BadRequestException( "Discount must be between 1 and 100");
        }
    }

    private PromoRes mapToResponse(Promo promo) {
        return PromoRes.builder()
                .id(promo.getId())
                .titleId(promo.getTitleId())
                .titleEn(promo.getTitleEn())
                .descriptionId(promo.getDescriptionId())
                .descriptionEn(promo.getDescriptionEn())
                .promoCode(promo.getPromoCode())
                .discountPct(promo.getDiscountPct())
                .startDate(promo.getStartDate())
                .endDate(promo.getEndDate())
                .startTime(promo.getStartTime())
                .endTime(promo.getEndTime())
                .imageUrl(promo.getImageUrl())
                .isActive(promo.getIsActive())
                .build();
    }
}