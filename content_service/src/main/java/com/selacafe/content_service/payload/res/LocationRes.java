package com.selacafe.content_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LocationRes {

    private Long id;

    private String name;

    private String city;

    private String addressId;

    private String addressEn;

    private String mapsUrl;

    private String phone;

    private String openHours;

    private Boolean isOpen;

    private String imageUrl;
}