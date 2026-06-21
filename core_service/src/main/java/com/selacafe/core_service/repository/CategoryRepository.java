package com.selacafe.core_service.repository;

import com.selacafe.core_service.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameId(String nameId);

    Optional<Category> findByNameId(String nameId);
}