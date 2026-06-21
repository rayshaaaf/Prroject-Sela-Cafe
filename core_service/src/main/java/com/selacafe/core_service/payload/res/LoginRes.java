package com.selacafe.core_service.payload.res;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRes {

    private String token;
    private String name;
    private String email;
    private String role;

}