package com.selacafe.order_service.service;

import com.selacafe.order_service.payload.req.ChargePaymentReq;
import com.selacafe.order_service.payload.res.PaymentRes;

public interface PaymentService {
    PaymentRes charge(ChargePaymentReq request);
    PaymentRes simulateSuccess(String transactionId);
    PaymentRes getPaymentByOrderId(Long orderId);
}
