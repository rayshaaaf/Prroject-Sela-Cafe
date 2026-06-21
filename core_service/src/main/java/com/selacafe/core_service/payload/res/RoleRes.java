package com.selacafe.core_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoleRes {

    private Long id;

    private String name;

    private String description;
}