package com.selacafe.order_service.repository;

import com.selacafe.order_service.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder_Id(Long orderId);
    List<OrderItem> findAll();
}