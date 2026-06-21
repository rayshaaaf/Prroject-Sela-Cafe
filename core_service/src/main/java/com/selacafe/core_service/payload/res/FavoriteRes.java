package com.selacafe.core_service.payload.res;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FavoriteRes {
    private Long id;
    private Long menuId;
    private String menuNameId;
    private String menuNameEn;
    private String imageUrl;
    private LocalDateTime createdAt;
}