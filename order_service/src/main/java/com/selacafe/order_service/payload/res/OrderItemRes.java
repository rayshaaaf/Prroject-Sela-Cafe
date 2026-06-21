package com.selacafe.order_service.payload.res;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemRes {
    private Long menuId;
    private String menuName;
    private BigDecimal menuPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private String notes;
}