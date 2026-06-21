package com.selacafe.order_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code")
    private String orderCode;

    @Column(name = "order_type")
    private String orderType;

    private String status;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "voucher_code")
    private String voucherCode;

    @Column(name = "discount_amount")
    private BigDecimal discountAmount;

    @Column(name = "delivery_fee")
    private BigDecimal deliveryFee;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    private String notes;

    @Column(name = "payment_method")
    private String paymentMethod;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private TableSession session;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "courier_id")
    private Long courierId;

    @Column(name = "courier_name")
    private String courierName;
}