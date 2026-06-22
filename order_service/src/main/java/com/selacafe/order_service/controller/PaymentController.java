package com.selacafe.order_service.controller;

import com.selacafe.order_service.payload.req.ChargePaymentReq;
import com.selacafe.order_service.payload.res.ApiRes;
import com.selacafe.order_service.payload.res.PaymentRes;
import com.selacafe.order_service.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/charge")
    public ResponseEntity<ApiRes<PaymentRes>> charge(
            @Valid @RequestBody ChargePaymentReq request) {

        return ResponseEntity.ok(
                ApiRes.<PaymentRes>builder()
                        .success(true)
                        .message("QRIS Payment charge initialized successfully")
                        .data(paymentService.charge(request))
                        .build()
        );
    }

    @PostMapping("/{transactionId}/simulate-success")
    public ResponseEntity<ApiRes<PaymentRes>> simulateSuccess(
            @PathVariable String transactionId) {

        return ResponseEntity.ok(
                ApiRes.<PaymentRes>builder()
                        .success(true)
                        .message("Payment simulation completed successfully")
                        .data(paymentService.simulateSuccess(transactionId))
                        .build()
        );
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiRes<PaymentRes>> getPaymentByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                ApiRes.<PaymentRes>builder()
                        .success(true)
                        .message("Payment retrieved successfully")
                        .data(paymentService.getPaymentByOrderId(orderId))
                        .build()
        );
    }

    @GetMapping("/trx/{transactionId}")
    public ResponseEntity<ApiRes<PaymentRes>> getPaymentByTransactionId(
            @PathVariable String transactionId) {

        return ResponseEntity.ok(
                ApiRes.<PaymentRes>builder()
                        .success(true)
                        .message("Payment retrieved successfully")
                        .data(paymentService.getPaymentByTransactionId(transactionId))
                        .build()
        );
    }
}
