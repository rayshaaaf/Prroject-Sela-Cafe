package com.selacafe.core_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PromoReq {

    @NotBlank
    private String titleId;

    @NotBlank
    private String titleEn;
    private String descriptionId;
    private String descriptionEn;
    private String promoCode;

    @NotNull
    private Integer discountPct;
    private LocalDate startDate;
    private LocalDate endDate;
    private String imageUrl;
    private Boolean isActive;
    private LocalTime startTime;
    private LocalTime endTime;
}