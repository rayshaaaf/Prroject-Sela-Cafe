package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.entity.Role;
import com.selacafe.core_service.entity.User;
import com.selacafe.core_service.payload.req.LoginReq;
import com.selacafe.core_service.payload.req.RegisterReq;
import com.selacafe.core_service.payload.res.LoginRes;
import com.selacafe.core_service.repository.RoleRepository;
import com.selacafe.core_service.repository.UserRepository;
import com.selacafe.core_service.security.JwtUtil;
import com.selacafe.core_service.service.AuthService;
import com.selacafe.core_service.exception.BadRequestException;
import com.selacafe.core_service.exception.ResourceNotFoundException;
import com.selacafe.core_service.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;

        @Value("${jwt.expiration.customer}")
        private Long customerExpiration;

        @Value("${jwt.expiration.staff}")
        private Long staffExpiration;

        @Override
        public void register(RegisterReq request) {

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new BadRequestException("Email already registered");
                }

                Role role = roleRepository.findByName("CUSTOMER")
                                .orElseThrow(() -> new ResourceNotFoundException("Role CUSTOMER not found"));

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(role)
                                .isActive(true)
                                .createdAt(LocalDateTime.now())
                                .build();

                userRepository.save(user);
        }

        @Override
        public LoginRes login(LoginReq request) {

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

                if (!Boolean.TRUE.equals(user.getIsActive())) {

                        throw new UnauthorizedException(
                                        "Account has been deactivated");
                }

                if (!passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword())) {

                        throw new UnauthorizedException(
                                        "Invalid email or password");
                }

                String role = user.getRole().getName();

                Long expiration = "CUSTOMER".equals(role)
                                ? customerExpiration
                                : staffExpiration;

                String token = jwtUtil.generateToken(
                                user.getId(),
                                user.getEmail(),
                                role,
                                expiration);

                return LoginRes.builder()
                                .token(token)
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(role)
                                .build();
        }

        @Override
        public User getCurrentUser() {

                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
}