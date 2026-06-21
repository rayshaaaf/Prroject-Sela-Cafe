package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.req.LoginReq;
import com.selacafe.core_service.payload.req.RegisterReq;
import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.LoginRes;
import com.selacafe.core_service.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {


private final AuthService authService;

@PostMapping("/register")
public ResponseEntity<ApiRes<String>> register(
        @Valid @RequestBody RegisterReq request) {

    authService.register(request);

    return ResponseEntity.ok(
            ApiRes.<String>builder()
                    .success(true)
                    .message("Register success")
                    .data(null)
                    .build()
    );
}

// @PostMapping("/logintes")
// public ResponseEntity<String> login(
//         @RequestBody LoginReq request) {

//     return ResponseEntity.ok("LOGIN BERHASIL");
// }



@PostMapping("/login")
public ResponseEntity<ApiRes<LoginRes>> login(
        @Valid @RequestBody LoginReq request) {

    LoginRes response =
            authService.login(request);

    return ResponseEntity.ok(
            ApiRes.<LoginRes>builder()
                    .success(true)
                    .message("Login success")
                    .data(response)
                    .build()
    );
}


}
