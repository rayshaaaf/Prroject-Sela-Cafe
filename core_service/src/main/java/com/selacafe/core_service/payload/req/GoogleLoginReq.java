package com.selacafe.core_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginReq {
    @NotBlank(message = "Google ID token is required")
    private String token;
}
