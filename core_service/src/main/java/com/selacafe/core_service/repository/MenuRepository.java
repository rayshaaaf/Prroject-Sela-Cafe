package com.selacafe.core_service.repository;

import com.selacafe.core_service.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Long> {
}