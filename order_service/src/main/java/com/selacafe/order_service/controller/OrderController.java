package com.selacafe.order_service.controller;

import com.selacafe.order_service.payload.req.AssignCourierReq;
import com.selacafe.order_service.payload.req.CreateOrderReq;
import com.selacafe.order_service.payload.res.ApiRes;
import com.selacafe.order_service.payload.res.OrderRes;
import com.selacafe.order_service.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

        private final OrderService orderService;

        @PostMapping("/create")
        public ResponseEntity<ApiRes<OrderRes>> createOrder(
                        @RequestHeader(value = "X-User-Id", required = false) Long userId,
                        @Valid @RequestBody CreateOrderReq request) {

                return ResponseEntity.ok(
                                ApiRes.<OrderRes>builder()
                                                .success(true)
                                                .message("Order created successfully")
                                                .data(
                                                                orderService.createOrder(
                                                                                userId,
                                                                                request))
                                                .build());
        }

        @GetMapping("/getById/{id}")
        public ResponseEntity<ApiRes<OrderRes>> getById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                ApiRes.<OrderRes>builder()
                                                .success(true)
                                                .message("Order retrieved successfully")
                                                .data(
                                                                orderService.getOrderById(id))
                                                .build());
        }

        @GetMapping("/getAll")
        public ResponseEntity<ApiRes<List<OrderRes>>> getAll() {

                return ResponseEntity.ok(
                                ApiRes.<List<OrderRes>>builder()
                                                .success(true)
                                                .message("Orders retrieved successfully")
                                                .data(
                                                                orderService.getAllOrders())
                                                .build());
        }

        @GetMapping("/my")
        public ResponseEntity<ApiRes<List<OrderRes>>> getMyOrders(
                        @RequestHeader("X-User-Id") Long userId) {

                return ResponseEntity.ok(
                                ApiRes.<List<OrderRes>>builder()
                                                .success(true)
                                                .message("Orders retrieved successfully")
                                                .data(
                                                                orderService.getOrdersByUserId(userId))
                                                .build());
        }

        @PutMapping("/updateStatus/{id}")
        public ResponseEntity<ApiRes<OrderRes>> updateStatus(
                        @RequestHeader("X-Role") String role,
                        @PathVariable Long id,
                        @RequestParam String status) {

                return ResponseEntity.ok(
                                ApiRes.<OrderRes>builder()
                                                .success(true)
                                                .message("Order status updated")
                                                .data(
                                                                orderService.updateStatus(
                                                                                id,
                                                                                status,
                                                                                role))
                                                .build());
        }

        @PutMapping("/{id}/assign-courier")
        public ResponseEntity<ApiRes<OrderRes>> assignCourier(
                        @RequestHeader("X-Role") String role,
                        @PathVariable Long id,
                        @RequestBody AssignCourierReq request) {

                return ResponseEntity.ok(
                                ApiRes.<OrderRes>builder()
                                                .success(true)
                                                .message("Courier assigned successfully")
                                                .data(orderService.assignCourier(id, request, role))
                                                .build());
        }

        @GetMapping("/status/{status}")
        public ResponseEntity<ApiRes<List<OrderRes>>> getOrdersByStatus(
                        @PathVariable String status) {

                return ResponseEntity.ok(
                                ApiRes.<List<OrderRes>>builder()
                                                .success(true)
                                                .message("Orders retrieved successfully")
                                                .data(
                                                                orderService
                                                                                .getOrdersByStatus(
                                                                                                status))
                                                .build());
        }

        @GetMapping("/kitchen")
        public ResponseEntity<ApiRes<List<OrderRes>>> getKitchenOrders() {

                return ResponseEntity.ok(
                                ApiRes.<List<OrderRes>>builder()
                                                .success(true)
                                                .message("Kitchen orders retrieved")
                                                .data(
                                                                orderService
                                                                                .getKitchenOrders())
                                                .build());
        }

        @GetMapping("/my-deliveries")
        public ResponseEntity<ApiRes<List<OrderRes>>> getMyDeliveries(@RequestHeader("X-User-Id") Long courierId) {
                return ResponseEntity.ok(
                                ApiRes.<List<OrderRes>>builder()
                                                .success(true)
                                                .message("Courier orders retrieved successfully")
                                                .data(
                                                                orderService.getCourierOrders(
                                                                                courierId))
                                                .build());
        }


}