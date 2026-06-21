package com.selacafe.content_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "careers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Career {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "position_id")
    private String positionId;

    @Column(name = "position_en")
    private String positionEn;

    @Column(name = "description_id", columnDefinition = "TEXT")
    private String descriptionId;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "requirements_id", columnDefinition = "TEXT")
    private String requirementsId;

    @Column(name = "requirements_en", columnDefinition = "TEXT")
    private String requirementsEn;

    @Builder.Default
    @Column(name = "is_open")
    private Boolean isOpen = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}