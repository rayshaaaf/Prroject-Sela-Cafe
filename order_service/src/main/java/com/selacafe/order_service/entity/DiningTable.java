package com.selacafe.order_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dining_tables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiningTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "table_number", nullable = false, unique = true)
    private String tableNumber;

    private Integer capacity;

    @Column(name = "qr_code")
    private String qrCode;

    private String status;
}