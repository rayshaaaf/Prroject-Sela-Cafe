package com.selacafe.order_service.payload.req;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderReq {
    private Long sessionId;
    private Long tableId;
    private String orderType;
    private String paymentMethod;
    private String voucherCode;
    private String customerName;
    private String customerPhone;
    private String deliveryAddress;
    private String notes;
    private List<OrderItemReq> items;
}