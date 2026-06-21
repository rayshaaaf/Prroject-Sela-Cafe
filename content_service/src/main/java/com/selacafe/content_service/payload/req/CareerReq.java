package com.selacafe.content_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CareerReq {

    @NotBlank(message = "Position (ID) is required")
    private String positionId;

    @NotBlank(message = "Position (EN) is required")
    private String positionEn;

    @NotBlank(message = "Description (ID) is required")
    private String descriptionId;

    @NotBlank(message = "Description (EN) is required")
    private String descriptionEn;

    @NotBlank(message = "Requirements (ID) is required")
    private String requirementsId;

    @NotBlank(message = "Requirements (EN) is required")
    private String requirementsEn;

    private Boolean isOpen;
}