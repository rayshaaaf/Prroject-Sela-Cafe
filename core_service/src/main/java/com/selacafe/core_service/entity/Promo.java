package com.selacafe.core_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "promos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Promo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title_id", nullable = false)
    private String titleId;

    @Column(name = "title_en", nullable = false)
    private String titleEn;

    @Column(name = "description_id")
    private String descriptionId;

    @Column(name = "description_en")
    private String descriptionEn;

    @Column(name = "promo_code")
    private String promoCode;

    @Column(name = "discount_pct")
    private Integer discountPct;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;
}