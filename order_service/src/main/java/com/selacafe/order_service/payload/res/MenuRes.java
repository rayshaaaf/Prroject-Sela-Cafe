package com.selacafe.order_service.payload.res;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MenuRes {
    private Long id;
    private String nameId;
    private String nameEn;
    private BigDecimal price;
    private Boolean isAvailable;
    private Integer stock;
}