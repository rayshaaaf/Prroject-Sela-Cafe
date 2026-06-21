package com.selacafe.order_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DiningTableRes {

    private Long id;
    private String tableNumber;
    private Integer capacity;
    private String qrCode;
    private String status;
}