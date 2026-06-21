package com.selacafe.core_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryRes {

    private Long id;
    private String nameId;
    private String nameEn;
}