package com.selacafe.order_service.payload.req;

import lombok.Data;

@Data
public class AssignCourierReq {
    private Long courierId;
    private String courierName;
}