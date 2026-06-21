package com.selacafe.content_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BannerRes {
    private Long id;
    private String title;
    private String imageUrl;
    private Boolean isActive;
}
