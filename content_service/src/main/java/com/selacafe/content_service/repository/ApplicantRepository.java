package com.selacafe.content_service.repository;

import com.selacafe.content_service.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicantRepository
        extends JpaRepository<Applicant, Long> {
}