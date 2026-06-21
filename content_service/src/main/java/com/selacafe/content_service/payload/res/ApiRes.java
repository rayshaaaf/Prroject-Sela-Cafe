package com.selacafe.content_service.payload.res;

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
