package com.selacafe.order_service.payload.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    private LocalTime startTime;
    private LocalTime endTime;
    private String imageUrl;
    private Boolean isActive;
}
