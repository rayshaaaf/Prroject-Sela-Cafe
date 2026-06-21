package com.selacafe.core_service.payload.res;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class MenuRes {

    private Long id;

    private String nameId;
    private String nameEn;
    private String descriptionId;
    private String descriptionEn;
    private BigDecimal price;
    private Integer stock;
    private Boolean isAvailable;
    private Long categoryId;
    private String categoryName;
    private String imageUrl;
}