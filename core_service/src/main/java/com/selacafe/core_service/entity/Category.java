package com.selacafe.core_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_id", nullable = false, unique = true)
    private String nameId;

    @Column(name = "name_en", nullable = false, unique = true)
    private String nameEn;
}