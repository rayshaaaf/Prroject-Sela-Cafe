package com.selacafe.order_service.repository;

import com.selacafe.order_service.entity.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiningTableRepository
        extends JpaRepository<DiningTable, Long> {

    Optional<DiningTable> findByTableNumber(String tableNumber);

    Optional<DiningTable> findByQrCode(String qrCode);
}