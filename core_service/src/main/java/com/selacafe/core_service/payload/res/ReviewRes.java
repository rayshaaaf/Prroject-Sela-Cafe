package com.selacafe.core_service.payload.res;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewRes {
    private Long id;
    private Long menuId;
    private String menuNameId;
    private String menuNameEn;
    private Integer rating;
    private String comment;
    private String userName;
    private LocalDateTime createdAt;
}