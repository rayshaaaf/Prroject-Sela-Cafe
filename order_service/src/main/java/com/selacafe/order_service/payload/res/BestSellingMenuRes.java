package com.selacafe.order_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BestSellingMenuRes {

    private Long menuId;

    private String menuName;

    private Long totalSold;
}
