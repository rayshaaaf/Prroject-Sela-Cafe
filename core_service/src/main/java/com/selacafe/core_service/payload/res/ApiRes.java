package com.selacafe.core_service.payload.res;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiRes<T> {

    private Boolean success;
    private String message;
    private T data;
}
