package com.selacafe.content_service.repository;

import com.selacafe.content_service.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByIsOpenTrue();
}