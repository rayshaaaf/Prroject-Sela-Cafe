package com.selacafe.order_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DiningTableReq {

    @NotBlank
    private String tableNumber;

    private Integer capacity;

    private String qrCode;
}