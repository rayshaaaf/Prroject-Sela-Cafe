package com.selacafe.content_service.repository;

import com.selacafe.content_service.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findByIsActiveTrue();
}