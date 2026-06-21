package com.selacafe.content_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BannerReq {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    private Boolean isActive;
}