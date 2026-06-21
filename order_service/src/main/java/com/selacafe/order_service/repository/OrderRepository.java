package com.selacafe.order_service.repository;

import com.selacafe.order_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    List<Order> findByStatus(String status);
    List<Order> findByStatusIn(List<String> statuses);
    List<Order> findByCourierId(Long courierId);
    Long countByStatus(String status);
    Long countByOrderType(String orderType);
    
}