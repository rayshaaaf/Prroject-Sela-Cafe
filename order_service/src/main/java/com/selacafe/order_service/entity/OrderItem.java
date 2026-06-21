package com.selacafe.order_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "menu_id")
    private Long menuId;

    @Column(name = "menu_name")
    private String menuName;

    @Column(name = "menu_price")
    private BigDecimal menuPrice;

    private Integer quantity;

    private BigDecimal subtotal;

    private String notes;
}