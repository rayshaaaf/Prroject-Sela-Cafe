package com.selacafe.core_service.payload.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserRes {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private Boolean isActive;
}