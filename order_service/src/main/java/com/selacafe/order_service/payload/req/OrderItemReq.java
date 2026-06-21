package com.selacafe.order_service.payload.req;

import lombok.Data;

@Data
public class OrderItemReq {
    private Long menuId;
    private Integer quantity;
    private String notes;
}