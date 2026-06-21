package com.selacafe.order_service.exception;

import com.selacafe.order_service.payload.res.ApiRes;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(
            ResourceNotFoundException.class)
    public ResponseEntity<ApiRes<String>>
    handleNotFound(
            ResourceNotFoundException ex) {

        return ResponseEntity.status(
                HttpStatus.NOT_FOUND)
                .body(
                        ApiRes.<String>builder()
                                .success(false)
                                .message(ex.getMessage())
                                .data(null)
                                .build()
                );
    }

    @ExceptionHandler(
            BadRequestException.class)
    public ResponseEntity<ApiRes<String>>
    handleBadRequest(
            BadRequestException ex) {

        return ResponseEntity.status(
                HttpStatus.BAD_REQUEST)
                .body(
                        ApiRes.<String>builder()
                                .success(false)
                                .message(ex.getMessage())
                                .data(null)
                                .build()
                );
    }

    @ExceptionHandler(
            Exception.class)
    public ResponseEntity<ApiRes<String>>
    handleException(
            Exception ex) {

        return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        ApiRes.<String>builder()
                                .success(false)
                                .message(ex.getMessage())
                                .data(null)
                                .build()
                );
    }
}