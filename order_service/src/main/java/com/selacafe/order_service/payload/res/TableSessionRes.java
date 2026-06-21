package com.selacafe.order_service.payload.res;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TableSessionRes {
    private Long id;
    private Long tableId;
    private String tableNumber;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String status;
}