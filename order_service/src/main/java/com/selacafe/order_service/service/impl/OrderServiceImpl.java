package com.selacafe.order_service.service.impl;

import com.selacafe.order_service.client.CoreServiceClient;
import com.selacafe.order_service.entity.*;
import com.selacafe.order_service.exception.*;
import com.selacafe.order_service.payload.req.*;
import com.selacafe.order_service.payload.res.*;
import com.selacafe.order_service.repository.*;
import com.selacafe.order_service.service.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

        private final OrderRepository orderRepository;
        private final OrderItemRepository orderItemRepository;
        private final TableSessionRepository tableSessionRepository;
        private final CoreServiceClient coreServiceClient;

        @Override
        @Transactional
        public OrderRes createOrder(Long userId, CreateOrderReq request) {

                TableSession session = null;

                if ("DINE_IN".equals(request.getOrderType())) {

                        if (request.getSessionId() == null) {
                                throw new BadRequestException(
                                                "Session is required for dine in order");
                        }

                        session = tableSessionRepository
                                        .findByIdAndStatus(
                                                        request.getSessionId(),
                                                        "ACTIVE")
                                        .orElseThrow(() -> new BadRequestException(
                                                        "Session not active"));
                }

                if ("DELIVERY".equals(request.getOrderType())) {

                        if (request.getDeliveryAddress() == null
                                        || request.getDeliveryAddress().isBlank()) {

                                throw new BadRequestException(
                                                "Delivery address is required");
                        }
                }

                if (request.getItems() == null
                                || request.getItems().isEmpty()) {

                        throw new BadRequestException(
                                        "Order items cannot be empty");
                }

                Order order = Order.builder()
                                .orderCode(generateOrderCode())
                                .orderType(request.getOrderType())
                                .userId(userId)
                                .status("WAITING_PAYMENT")
                                .paymentMethod(request.getPaymentMethod())
                                .session(session)
                                .customerName(request.getCustomerName())
                                .customerPhone(request.getCustomerPhone())
                                .deliveryAddress(request.getDeliveryAddress())
                                .voucherCode(request.getVoucherCode())
                                .notes(request.getNotes())
                                .discountAmount(BigDecimal.ZERO)
                                .deliveryFee(BigDecimal.ZERO)
                                .totalPrice(BigDecimal.ZERO)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();

                order = orderRepository.save(order);

                BigDecimal totalPrice = BigDecimal.ZERO;

                for (OrderItemReq itemReq : request.getItems()) {

                        MenuRes menu = coreServiceClient.getMenu(
                                        itemReq.getMenuId());
                        if (itemReq.getQuantity() > menu.getStock()) {

                                throw new BadRequestException(
                                                "Insufficient stock for menu: "
                                                                + menu.getNameId());
                        }

                        if (!Boolean.TRUE.equals(menu.getIsAvailable())) {
                                throw new BadRequestException(
                                                "Menu is not available");
                        }

                        BigDecimal subtotal = menu.getPrice()
                                        .multiply(
                                                        BigDecimal.valueOf(
                                                                        itemReq.getQuantity()));

                        totalPrice = totalPrice.add(subtotal);

                        orderItemRepository.save(
                                        OrderItem.builder()
                                                        .order(order)
                                                        .menuId(menu.getId())
                                                        .menuName(menu.getNameId())
                                                        .menuPrice(menu.getPrice())
                                                        .quantity(itemReq.getQuantity())
                                                        .subtotal(subtotal)
                                                        .notes(itemReq.getNotes())
                                                        .build());
                }

                order.setTotalPrice(totalPrice);
                order.setUpdatedAt(LocalDateTime.now());

                orderRepository.save(order);

                return getOrderById(order.getId());
        }

        @Override
        public OrderRes getOrderById(
                        Long id) {

                Order order = orderRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found"));

                return mapToResponse(order);
        }

        @Override
        public List<OrderRes> getAllOrders() {

                return orderRepository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public OrderRes updateStatus(Long orderId, String status, String role) {

                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

                validateRoleForStatus(role, status, order.getOrderType());
                validateStatusTransition(order.getStatus(), status);
                order.setStatus(status);
                order.setUpdatedAt(LocalDateTime.now());

                if ("PAID".equals(status)) {

                        order.setPaidAt(LocalDateTime.now());

                        List<OrderItem> items = orderItemRepository.findByOrder_Id(
                                        order.getId());

                        for (OrderItem item : items) {

                                coreServiceClient.reduceStock(
                                                item.getMenuId(),
                                                item.getQuantity());
                        }
                }
                if ("COMPLETED".equals(status)) {
                        order.setCompletedAt(LocalDateTime.now());
                }
                orderRepository.save(order);

                return mapToResponse(order);
        }

        private void validateStatusTransition(String currentStatus, String newStatus) {

                boolean valid = switch (currentStatus) {
                        case "WAITING_PAYMENT" ->
                                newStatus.equals("PAID") || newStatus.equals("CANCELLED");
                        case "PAID" ->
                                newStatus.equals("PREPARING");
                        case "PREPARING" ->
                                newStatus.equals("READY");
                        case "READY" ->
                                newStatus.equals("ON_DELIVERY") || newStatus.equals("COMPLETED");
                        case "ON_DELIVERY" ->
                                newStatus.equals("COMPLETED");
                        case "COMPLETED", "CANCELLED" ->
                                throw new BadRequestException("Order status cannot be changed");
                        default -> false;
                };
                if (!valid) {
                        throw new BadRequestException("Invalid status transition");
                }
        }

        private void validateRoleForStatus(String role, String newStatus, String orderType) {

                switch (newStatus) {

                        case "PAID" -> {
                                if (!role.equals("CASHIER")
                                                && !role.equals("ADMIN")
                                                && !role.equals("OWNER")) {
                                        throw new BadRequestException(
                                                        "Only CASHIER can confirm payment");
                                }
                        }

                        case "PREPARING", "READY" -> {
                                if (!role.equals("KITCHEN")
                                                && !role.equals("ADMIN")
                                                && !role.equals("OWNER")) {
                                        throw new BadRequestException(
                                                        "Only KITCHEN can update this status");
                                }
                        }

                        case "ON_DELIVERY" -> {
                                if (!role.equals("COURIER")
                                                && !role.equals("ADMIN")
                                                && !role.equals("OWNER")) {

                                        throw new BadRequestException(
                                                        "Only COURIER can update this status");
                                }
                        }

                        case "COMPLETED" -> {
                                if ("DELIVERY".equals(orderType)) {
                                        if (!role.equals("COURIER")
                                                        && !role.equals("ADMIN")
                                                        && !role.equals("OWNER")) {
                                                throw new BadRequestException(
                                                                "Only COURIER can complete delivery orders");
                                        }
                                } else {
                                        if (!role.equals("CASHIER")
                                                        && !role.equals("ADMIN")
                                                        && !role.equals("OWNER")) {
                                                throw new BadRequestException(
                                                                "Only CASHIER can complete dine-in orders");
                                        }
                                }
                        }

                        case "CANCELLED" -> {
                                if (!role.equals("CASHIER")
                                                && !role.equals("ADMIN")
                                                && !role.equals("OWNER")) {
                                        throw new BadRequestException(
                                                        "Only CASHIER can cancel order");
                                }
                        }
                }
        }

        private List<OrderItemRes> mapItems(Long orderId) {
                return orderItemRepository.findByOrder_Id(orderId).stream()
                                .map(item -> OrderItemRes.builder()
                                                .menuId(item.getMenuId())
                                                .menuName(item.getMenuName())
                                                .menuPrice(item.getMenuPrice())
                                                .quantity(item.getQuantity())
                                                .subtotal(item.getSubtotal())
                                                .notes(item.getNotes())
                                                .build())
                                .toList();
        }

        private OrderRes mapToResponse(Order order) {
                return OrderRes.builder()
                                .id(order.getId())
                                .orderCode(order.getOrderCode())
                                .orderType(order.getOrderType())
                                .status(order.getStatus())
                                .paymentMethod(order.getPaymentMethod())
                                .totalPrice(order.getTotalPrice())
                                .discountAmount(order.getDiscountAmount())
                                .deliveryFee(order.getDeliveryFee())
                                .customerName(order.getCustomerName())
                                .customerPhone(order.getCustomerPhone())
                                .deliveryAddress(order.getDeliveryAddress())
                                .notes(order.getNotes())
                                .createdAt(order.getCreatedAt())
                                .items(mapItems(order.getId()))
                                .courierId(order.getCourierId())
                                .courierName(order.getCourierName())
                                .build();
        }

        private String generateOrderCode() {
                return "ORD-" + System.currentTimeMillis();
        }

        @Override
        public OrderRes assignCourier(
                        Long orderId,
                        AssignCourierReq request,
                        String role) {

                if (!role.equals("CASHIER")
                                && !role.equals("ADMIN")
                                && !role.equals("OWNER")) {

                        throw new BadRequestException(
                                        "Only CASHIER can assign courier");
                }

                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found"));

                if (!"READY".equals(order.getStatus())) {
                        throw new BadRequestException(
                                        "Order is not ready");
                }

                if (!"DELIVERY".equals(order.getOrderType())) {
                        throw new BadRequestException(
                                        "Courier can only be assigned to delivery orders");
                }

                order.setCourierId(request.getCourierId());
                order.setCourierName(request.getCourierName());
                order.setUpdatedAt(LocalDateTime.now());

                orderRepository.save(order);

                return mapToResponse(order);
        }

        @Override
        public List<OrderRes> getOrdersByStatus(
                        String status) {

                return orderRepository
                                .findByStatus(status)
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public List<OrderRes> getKitchenOrders() {

                return orderRepository
                                .findByStatusIn(List.of("PAID", "PREPARING"))
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public List<OrderRes> getCourierOrders(
                        Long courierId) {

                return orderRepository
                                .findByCourierId(courierId)
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public DashboardAnalyticsRes getAnalytics() {

                Long totalOrders = orderRepository.count();

                Long completedOrders = orderRepository.countByStatus(
                                "COMPLETED");

                Long deliveryOrders = orderRepository.countByOrderType(
                                "DELIVERY");

                Long dineInOrders = orderRepository.countByOrderType(
                                "DINE_IN");

                Double totalRevenue = orderRepository.findAll()
                                .stream()
                                .filter(order -> "COMPLETED".equals(
                                                order.getStatus()))
                                .map(Order::getTotalPrice)
                                .mapToDouble(BigDecimal::doubleValue)
                                .sum();

                return DashboardAnalyticsRes.builder()
                                .totalOrders(totalOrders)
                                .completedOrders(completedOrders)
                                .deliveryOrders(deliveryOrders)
                                .dineInOrders(dineInOrders)
                                .totalRevenue(totalRevenue)
                                .build();
        }

        @Override
        public List<BestSellingMenuRes> getBestSellingMenus() {

                Map<Long, BestSellingMenuRes> map = new HashMap<>();

                orderItemRepository.findAll()
                                .forEach(item -> {

                                        map.compute(
                                                        item.getMenuId(),
                                                        (key, value) -> {

                                                                if (value == null) {

                                                                        return BestSellingMenuRes
                                                                                        .builder()
                                                                                        .menuId(
                                                                                                        item.getMenuId())
                                                                                        .menuName(
                                                                                                        item.getMenuName())
                                                                                        .totalSold(
                                                                                                        (long) item.getQuantity())
                                                                                        .build();
                                                                }

                                                                value.setTotalSold(
                                                                                value.getTotalSold()
                                                                                                + item.getQuantity());

                                                                return value;
                                                        });
                                });

                return map.values()
                                .stream()
                                .sorted(
                                                (a, b) -> Long.compare(
                                                                b.getTotalSold(),
                                                                a.getTotalSold()))
                                .limit(5)
                                .toList();
        }

}