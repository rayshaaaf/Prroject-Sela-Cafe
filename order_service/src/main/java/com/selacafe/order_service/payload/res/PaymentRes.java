package com.selacafe.order_service.payload.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRes {
    private Long id;
    private Long orderId;
    private String transactionId;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private String qrisCode;
    private String qrisImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
