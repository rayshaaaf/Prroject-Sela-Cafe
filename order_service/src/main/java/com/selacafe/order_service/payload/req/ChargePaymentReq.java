package com.selacafe.order_service.payload.req;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChargePaymentReq {

    @NotNull
    private Long orderId;

    private String paymentMethod; // e.g. "QRIS"
}
