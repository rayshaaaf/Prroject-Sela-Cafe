package com.selacafe.core_service.payload.res;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class PromoRes {

    private Long id;
    private String titleId;
    private String titleEn;
    private String descriptionId;
    private String descriptionEn;
    private String promoCode;
    private Integer discountPct;
    private LocalDate startDate;
    private LocalDate endDate;
    private String imageUrl;
    private Boolean isActive;
    private LocalTime startTime;
    private LocalTime endTime;
}