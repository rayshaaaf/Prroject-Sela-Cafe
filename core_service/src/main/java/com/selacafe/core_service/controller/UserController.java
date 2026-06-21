package com.selacafe.core_service.controller;

import com.selacafe.core_service.payload.req.UpdateProfileReq;
import com.selacafe.core_service.payload.req.UpdateRoleReq;
import com.selacafe.core_service.payload.res.ApiRes;
import com.selacafe.core_service.payload.res.UserRes;
import com.selacafe.core_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

        private final UserService userService;

        @GetMapping("/profile")
        public ResponseEntity<ApiRes<UserRes>> getProfile() {
                return ResponseEntity.ok(
                                ApiRes.<UserRes>builder()
                                                .success(true)
                                                .message("Profile retrieved successfully")
                                                .data(userService.getProfile())
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @GetMapping("/getAll")
        public ResponseEntity<ApiRes<List<UserRes>>> getAllUsers() {
                return ResponseEntity.ok(
                                ApiRes.<List<UserRes>>builder()
                                                .success(true)
                                                .message("Users retrieved successfully")
                                                .data(userService.getAllUsers())
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @GetMapping("/getById/{id}")
        public ResponseEntity<ApiRes<UserRes>> getUserById(
                        @PathVariable Long id) {
                return ResponseEntity.ok(
                                ApiRes.<UserRes>builder()
                                                .success(true)
                                                .message("User retrieved successfully")
                                                .data(userService.getUserById(id))
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @PutMapping("/{id}/role")
        public ResponseEntity<ApiRes<UserRes>> updateRole(
                        @PathVariable Long id,
                        @RequestBody UpdateRoleReq request) {
                return ResponseEntity.ok(
                                ApiRes.<UserRes>builder()
                                                .success(true)
                                                .message("User role updated successfully")
                                                .data(userService.updateRole(id, request.getRole()))
                                                .build());
        }

        @PutMapping("/{id}/activate")
        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        public ResponseEntity<ApiRes<UserRes>> activate(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                ApiRes.<UserRes>builder()
                                                .success(true)
                                                .message("User activated successfully")
                                                .data(userService.activate(id))
                                                .build());
        }

        @PutMapping("/{id}/deactivate")
        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        public ResponseEntity<ApiRes<UserRes>> deactivate(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                ApiRes.<UserRes>builder()
                                                .success(true)
                                                .message("User deactivated successfully")
                                                .data(userService.deactivate(id))
                                                .build());
        }

        @PutMapping("/profile")
        public ResponseEntity<ApiRes<UserRes>> updateProfile(
                        @RequestBody UpdateProfileReq request) {

                return ResponseEntity.ok(
                                ApiRes.<UserRes>builder()
                                                .success(true)
                                                .message("Profile updated successfully")
                                                .data(userService.updateProfile(request))
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @GetMapping("/search")
        public ResponseEntity<ApiRes<List<UserRes>>> searchUsers(
                        @RequestParam String keyword) {

                return ResponseEntity.ok(
                                ApiRes.<List<UserRes>>builder()
                                                .success(true)
                                                .message("Users retrieved successfully")
                                                .data(userService.searchUsers(keyword))
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @GetMapping("/active")
        public ResponseEntity<ApiRes<List<UserRes>>> getActiveUsers() {

                return ResponseEntity.ok(
                                ApiRes.<List<UserRes>>builder()
                                                .success(true)
                                                .message("Active users retrieved successfully")
                                                .data(userService.getActiveUsers())
                                                .build());
        }

        @PreAuthorize("hasAnyAuthority('ADMIN','OWNER')")
        @GetMapping("/inactive")
        public ResponseEntity<ApiRes<List<UserRes>>> getInactiveUsers() {

                return ResponseEntity.ok(
                                ApiRes.<List<UserRes>>builder()
                                                .success(true)
                                                .message("Inactive users retrieved successfully")
                                                .data(userService.getInactiveUsers())
                                                .build());
        }
}