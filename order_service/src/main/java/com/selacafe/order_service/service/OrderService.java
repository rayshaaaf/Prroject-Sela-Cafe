package com.selacafe.order_service.service;

import com.selacafe.order_service.payload.req.AssignCourierReq;
import com.selacafe.order_service.payload.req.CreateOrderReq;
import com.selacafe.order_service.payload.res.BestSellingMenuRes;
import com.selacafe.order_service.payload.res.DashboardAnalyticsRes;
import com.selacafe.order_service.payload.res.OrderRes;

import java.util.List;

public interface OrderService {
    OrderRes createOrder(Long userId,CreateOrderReq request);
    OrderRes getOrderById(Long id);
    List<OrderRes> getAllOrders();
    OrderRes updateStatus(Long orderId,String status,String role);
    OrderRes assignCourier(Long orderId,AssignCourierReq request,String role);
    List<OrderRes> getOrdersByStatus(String status);
    List<OrderRes> getKitchenOrders();
    List<OrderRes> getCourierOrders(Long courierId);
    DashboardAnalyticsRes getAnalytics();
    List<BestSellingMenuRes> getBestSellingMenus();
}