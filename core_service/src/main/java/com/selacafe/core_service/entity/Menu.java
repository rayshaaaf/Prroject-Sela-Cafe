package com.selacafe.core_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "menus")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_id", nullable = false)
    private String nameId;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "description_id")
    private String descriptionId;

    @Column(name = "description_en")
    private String descriptionEn;

    @Column(nullable = false)
    private BigDecimal price;

    private Integer stock;

    private Boolean isAvailable;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}