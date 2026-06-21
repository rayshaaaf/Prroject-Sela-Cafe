package com.selacafe.content_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CareerRes {

    private Long id;

    private String positionId;

    private String positionEn;

    private String descriptionId;

    private String descriptionEn;

    private String requirementsId;

    private String requirementsEn;

    private Boolean isOpen;
}