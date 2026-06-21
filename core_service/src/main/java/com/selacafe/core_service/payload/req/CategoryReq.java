package com.selacafe.core_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryReq {

    @NotBlank(message = "Nama Indonesia wajib diisi")
    private String nameId;

    @NotBlank(message = "Nama Inggris wajib diisi")
    private String nameEn;
}