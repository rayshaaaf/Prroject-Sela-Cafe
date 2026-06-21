package com.selacafe.order_service.payload.res;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderRes {
    private Long id;
    private String orderCode;
    private String orderType;
    private String status;
    private String paymentMethod;
    private BigDecimal totalPrice;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private String customerName;
    private String customerPhone;
    private String deliveryAddress;
    private String notes;
    private LocalDateTime createdAt;
    private List<OrderItemRes> items;
    private Long courierId;
    private String courierName;
}