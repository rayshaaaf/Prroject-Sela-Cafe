package com.selacafe.order_service.service.impl;

import com.selacafe.order_service.entity.Order;
import com.selacafe.order_service.entity.Payment;
import com.selacafe.order_service.exception.BadRequestException;
import com.selacafe.order_service.exception.ResourceNotFoundException;
import com.selacafe.order_service.payload.req.ChargePaymentReq;
import com.selacafe.order_service.payload.res.PaymentRes;
import com.selacafe.order_service.repository.OrderRepository;
import com.selacafe.order_service.repository.PaymentRepository;
import com.selacafe.order_service.service.OrderService;
import com.selacafe.order_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Override
    public PaymentRes charge(ChargePaymentReq request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!"WAITING_PAYMENT".equals(order.getStatus())) {
            throw new BadRequestException("Order status must be WAITING_PAYMENT. Current status: " + order.getStatus());
        }

        // Check if payment already exists for this order
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);

        if (payment == null) {
            String transactionId = "TX-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            String qrisCode = generateQrisCode("Sela Cafe", order.getOrderCode(), order.getTotalPrice());

            payment = Payment.builder()
                    .orderId(order.getId())
                    .transactionId(transactionId)
                    .amount(order.getTotalPrice())
                    .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "QRIS")
                    .status("PENDING")
                    .qrisCode(qrisCode)
                    .createdAt(LocalDateTime.now())
                    .build();

            payment = paymentRepository.save(payment);
        }

        return mapToResponse(payment);
    }

    @Override
    public PaymentRes simulateSuccess(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found"));

        if ("SUCCESS".equals(payment.getStatus())) {
            return mapToResponse(payment);
        }

        payment.setStatus("SUCCESS");
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Update the corresponding Order status to PAID
        orderService.updateStatus(payment.getOrderId(), "PAID", "ADMIN");

        return mapToResponse(payment);
    }

    @Override
    public PaymentRes getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order ID: " + orderId));
        return mapToResponse(payment);
    }

    private PaymentRes mapToResponse(Payment payment) {
        String encodedQris = java.net.URLEncoder.encode(payment.getQrisCode(), StandardCharsets.UTF_8);
        String qrisImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodedQris;

        return PaymentRes.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .qrisCode(payment.getQrisCode())
                .qrisImageUrl(qrisImageUrl)
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();
    }

    private String generateQrisCode(String merchantName, String orderCode, BigDecimal amount) {
        // Format amount as integer string (e.g. 15000)
        String amountStr = String.valueOf(amount.setScale(0, RoundingMode.HALF_UP).intValue());

        StringBuilder qris = new StringBuilder();
        qris.append("000201"); // Payload Indicator
        qris.append("010212"); // Point of Initiation Method: 12 (Dynamic QR)

        // Merchant Account Info (Tag 26) - National ID (QRIS)
        String merchantInfoVal = "0017ID.CO.QRIS.WWW0215ID1020211234560303UME";
        qris.append("26").append(String.format("%02d", merchantInfoVal.length())).append(merchantInfoVal);

        qris.append("52045812"); // Merchant Category Code: 5812 (Restaurants)
        qris.append("5303360");  // Currency Code: 360 (IDR)

        // Amount (Tag 54)
        qris.append("54").append(String.format("%02d", amountStr.length())).append(amountStr);

        qris.append("5802ID"); // Country Code: ID

        // Merchant Name (Tag 59)
        qris.append("59").append(String.format("%02d", merchantName.length())).append(merchantName);

        // Merchant City (Tag 60)
        String city = "Depok";
        qris.append("60").append(String.format("%02d", city.length())).append(city);

        // Postal Code (Tag 61)
        String postal = "16424";
        qris.append("61").append(String.format("%02d", postal.length())).append(postal);

        // Additional Data Field (Tag 62) - contains the order code for tracking
        String orderTag = "07" + String.format("%02d", orderCode.length()) + orderCode;
        qris.append("62").append(String.format("%02d", orderTag.length())).append(orderTag);

        // CRC16 Placeholder (Tag 6304)
        qris.append("6304");

        // Calculate CRC16 checksum
        String checksum = calculateCRC16(qris.toString());
        qris.append(checksum);

        return qris.toString();
    }

    private String calculateCRC16(String data) {
        int crc = 0xFFFF;          // initial value
        int polynomial = 0x1021;   // 0001 0000 0010 0001  (0, 5, 12)
        byte[] bytes = data.getBytes(StandardCharsets.US_ASCII);
        for (byte b : bytes) {
            for (int i = 0; i < 8; i++) {
                boolean bit = ((b >> (7 - i) & 1) == 1);
                boolean c15 = ((crc >> 15 & 1) == 1);
                crc <<= 1;
                if (c15 ^ bit) {
                    crc ^= polynomial;
                }
            }
        }
        crc &= 0xFFFF;
        return String.format("%04X", crc);
    }
}
