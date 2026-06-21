package com.selacafe.core_service.payload.res;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BestSellingMenuRes {

    private Long menuId;

    private String menuName;

    private Long totalSold;
}