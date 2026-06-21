package com.selacafe.order_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ScanTableReq {

    @NotBlank
    private String qrCode;
}