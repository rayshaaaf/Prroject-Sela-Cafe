package com.selacafe.content_service.repository;

import com.selacafe.content_service.entity.Career;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CareerRepository extends JpaRepository<Career, Long> {

    List<Career> findByIsOpenTrue();
}