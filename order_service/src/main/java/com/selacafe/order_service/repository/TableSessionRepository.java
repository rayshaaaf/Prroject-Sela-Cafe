package com.selacafe.order_service.repository;

import com.selacafe.order_service.entity.TableSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TableSessionRepository extends JpaRepository<TableSession, Long> {

    Optional<TableSession> findByDiningTableIdAndStatus(Long tableId,String status);
    Optional<TableSession> findByIdAndStatus(
        Long id,
        String status
);
}