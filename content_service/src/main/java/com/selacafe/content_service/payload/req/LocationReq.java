package com.selacafe.content_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LocationReq {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Address (ID) is required")
    private String addressId;

    @NotBlank(message = "Address (EN) is required")
    private String addressEn;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Maps URL is required")
    private String mapsUrl;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Open hours is required")
    private String openHours;

    private Boolean isOpen;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;
}