package com.selacafe.core_service.exception;

import com.selacafe.core_service.payload.res.ApiRes;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiRes<Object>> handleNotFound(
            ResourceNotFoundException e) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(
                        ApiRes.builder()
                                .success(false)
                                .message(e.getMessage())
                                .data(null)
                                .build()
                );
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiRes<Object>> handleBadRequest(
            BadRequestException e) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(
                        ApiRes.builder()
                                .success(false)
                                .message(e.getMessage())
                                .data(null)
                                .build()
                );
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiRes<Object>> handleUnauthorized(
            UnauthorizedException e) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(
                        ApiRes.builder()
                                .success(false)
                                .message(e.getMessage())
                                .data(null)
                                .build()
                );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiRes<Object>> handleException(
            Exception e) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        ApiRes.builder()
                                .success(false)
                                .message(e.getMessage())
                                .data(null)
                                .build()
                );
    }
}