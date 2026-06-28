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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Value("${qrisly.api.key}")
    private String apiKey;

    @Value("${qrisly.qris.id}")
    private int qrisId;

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
            String transactionId = null;
            String qrisCode = null;
            BigDecimal paymentAmount = null;

            try {
                // Call Komerce QRISLY API
                HttpClient client = HttpClient.newHttpClient();
                
                // Formulate JSON body
                Map<String, Object> payload = new HashMap<>();
                payload.put("qris_id", qrisId);
                payload.put("amount", order.getTotalPrice().setScale(0, RoundingMode.HALF_UP).intValue());
                payload.put("output_type", "string");
                
                ObjectMapper mapper = new ObjectMapper();
                String jsonBody = mapper.writeValueAsString(payload);

                HttpRequest requestBody = HttpRequest.newBuilder()
                        .uri(URI.create("https://api-sandbox.collaborator.komerce.id/user/api/v1/qrisly/generate-qris"))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("X-API-Key", apiKey)
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                        .build();

                HttpResponse<String> response = client.send(requestBody, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200 || response.statusCode() == 201) {
                    JsonNode root = mapper.readTree(response.body());
                    JsonNode dataNode = root.has("data") && !root.get("data").isNull() ? root.get("data") : root;
                    
                    if (dataNode.has("qris_string")) {
                        qrisCode = dataNode.get("qris_string").asText();
                    } else if (dataNode.has("qris_content")) {
                        qrisCode = dataNode.get("qris_content").asText();
                    } else if (dataNode.has("qris_code")) {
                        qrisCode = dataNode.get("qris_code").asText();
                    }

                    if (dataNode.has("history_id")) {
                        transactionId = dataNode.get("history_id").asText();
                    } else if (dataNode.has("transaction_id")) {
                        transactionId = dataNode.get("transaction_id").asText();
                    }

                    if (dataNode.has("final_amount")) {
                        paymentAmount = new BigDecimal(dataNode.get("final_amount").asText());
                    }

                    if (qrisCode == null || transactionId == null) {
                        throw new RuntimeException("Unexpected Komerce response structure: " + response.body());
                    }
                    System.out.println("Successfully generated QRIS via Komerce QRISLY. history_id: " + transactionId);
                } else {
                    throw new RuntimeException("Komerce API returned error status: " + response.statusCode() + ", body: " + response.body());
                }
            } catch (Exception e) {
                System.err.println("Komerce QRISLY generate failed: " + e.getMessage());
                throw new RuntimeException("Gagal menghubungkan ke layanan QRIS Sandbox: " + e.getMessage(), e);
            }

            payment = Payment.builder()
                    .orderId(order.getId())
                    .transactionId(transactionId)
                    .amount(paymentAmount != null ? paymentAmount : order.getTotalPrice())
                    .method(request.getPaymentMethod() != null ? request.getPaymentMethod() : "QRIS")
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

        // If status is PENDING and it is NOT a local fallback payment (starts with TX-), check status on Komerce
        if ("PENDING".equals(payment.getStatus()) && !payment.getTransactionId().startsWith("TX-")) {
            try {
                HttpClient client = HttpClient.newHttpClient();
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api-sandbox.collaborator.komerce.id/user/api/v1/qrisly/payment-status/" + payment.getTransactionId()))
                        .header("Authorization", "Bearer " + apiKey)
                        .header("X-API-Key", apiKey)
                        .GET()
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode root = mapper.readTree(response.body());
                    System.out.println("Komerce status response: " + response.body());
                    
                    JsonNode dataNode = root.has("data") && !root.get("data").isNull() ? root.get("data") : root;
                    
                    String payStatus = "";
                    if (dataNode.has("status")) {
                        payStatus = dataNode.get("status").asText();
                    } else if (dataNode.has("payment_status")) {
                        payStatus = dataNode.get("payment_status").asText();
                    }
                    
                    if (payStatus.equalsIgnoreCase("paid") || payStatus.equalsIgnoreCase("success") || payStatus.equalsIgnoreCase("settlement")) {
                        payment.setStatus("SUCCESS");
                        payment.setPaidAt(LocalDateTime.now());
                        paymentRepository.save(payment);

                        // Update corresponding Order status to PAID
                        orderService.updateStatus(payment.getOrderId(), "PAID", "ADMIN");
                    }
                }
            } catch (Exception e) {
                System.err.println("Error checking Komerce QRISLY status: " + e.getMessage());
            }
        }

        return mapToResponse(payment);
    }

    @Override
    public PaymentRes getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found: " + transactionId));
        return mapToResponse(payment);
    }

    private String getActiveIpAddress() {
        try {
            java.util.Enumeration<java.net.NetworkInterface> interfaces = java.net.NetworkInterface.getNetworkInterfaces();
            String candidate = null;
            while (interfaces.hasMoreElements()) {
                java.net.NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp()) {
                    continue;
                }
                java.util.Enumeration<java.net.InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    java.net.InetAddress addr = addresses.nextElement();
                    if (addr instanceof java.net.Inet4Address) {
                        String ip = addr.getHostAddress();
                        if (ip.startsWith("192.168.") || ip.startsWith("172.")) {
                            return ip; // Highly prefer active local network / mobile hotspot range
                        }
                        if (ip.startsWith("10.")) {
                            candidate = ip; // Keep as lower priority fallback
                        }
                    }
                }
            }
            if (candidate != null) {
                return candidate;
            }
        } catch (Exception e) {
            System.err.println("Error reading network interfaces: " + e.getMessage());
        }
        try {
            return java.net.InetAddress.getLocalHost().getHostAddress();
        } catch (Exception e) {
            return "127.0.0.1";
        }
    }

    private PaymentRes mapToResponse(Payment payment) {
        String ipAddress = getActiveIpAddress();
        String mobileConfirmUrl = "http://" + ipAddress + ":8090/api/payments/web/confirm-payment.html?trx=" + payment.getTransactionId();
        String encodedUrl = java.net.URLEncoder.encode(mobileConfirmUrl, StandardCharsets.UTF_8);
        String qrisImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodedUrl;

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

}
