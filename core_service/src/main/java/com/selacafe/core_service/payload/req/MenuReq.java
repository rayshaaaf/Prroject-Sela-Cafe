package com.selacafe.core_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MenuReq {

    @NotBlank
    private String nameId;

    @NotBlank
    private String nameEn;

    private String descriptionId;

    private String descriptionEn;

    @NotNull
    private BigDecimal price;

    @NotNull
    private Integer stock;

    @NotNull
    private Long categoryId;

    private String imageUrl;
}