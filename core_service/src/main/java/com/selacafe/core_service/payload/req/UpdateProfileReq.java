package com.selacafe.core_service.payload.req;

import lombok.Data;

@Data
public class UpdateProfileReq {

    private String name;

    private String phone;
}