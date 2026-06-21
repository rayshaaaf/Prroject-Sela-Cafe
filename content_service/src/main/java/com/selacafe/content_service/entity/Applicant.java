package com.selacafe.content_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applicants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "career_id")
    private Career career;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "cv_filename")
    private String cvFilename;

    @Column(name = "cover_letter")
    private String coverLetter;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    @PrePersist
    public void prePersist() {
        appliedAt = LocalDateTime.now();
    }
}