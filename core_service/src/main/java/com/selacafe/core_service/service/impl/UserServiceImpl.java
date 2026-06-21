package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.entity.Role;
import com.selacafe.core_service.entity.User;
import com.selacafe.core_service.exception.ResourceNotFoundException;
import com.selacafe.core_service.payload.req.UpdateProfileReq;
import com.selacafe.core_service.payload.res.UserRes;
import com.selacafe.core_service.repository.RoleRepository;
import com.selacafe.core_service.repository.UserRepository;
import com.selacafe.core_service.service.UserService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;

        private UserRes mapToResponse(User user) {
                return UserRes.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .role(user.getRole().getName())
                                .isActive(user.getIsActive())
                                .build();
        }

        @Override
        public UserRes getProfile() {

                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return mapToResponse(user);
        }

        @Override
        public List<UserRes> getAllUsers() {

                return userRepository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public UserRes getUserById(Long id) {

                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return mapToResponse(user);
        }

        @Override
        public UserRes updateRole(
                        Long userId,
                        String roleName) {

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Role role = roleRepository.findByName(roleName)
                                .orElseThrow(() -> new RuntimeException("Role not found"));

                user.setRole(role);

                userRepository.save(user);
                return mapToResponse(user);
        }

        @Override
        public UserRes activate(Long id) {

                User user = userRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found"));

                user.setIsActive(true);

                User updatedUser = userRepository.save(user);

                return mapToResponse(updatedUser);
        }

        @Override
        public UserRes deactivate(Long id) {

                User user = userRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found"));

                user.setIsActive(false);

                User updatedUser = userRepository.save(user);

                return mapToResponse(updatedUser);
        }

        @Override
        public UserRes updateProfile(
                        UpdateProfileReq request) {

                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found"));

                user.setName(request.getName());
                user.setPhone(request.getPhone());

                User updatedUser = userRepository.save(user);

                return mapToResponse(updatedUser);
        }

        @Override
        public List<UserRes> searchUsers(
                        String keyword) {

                return userRepository
                                .findByNameContainingIgnoreCase(keyword)
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public List<UserRes> getActiveUsers() {

                return userRepository.findByIsActiveTrue()
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public List<UserRes> getInactiveUsers() {

                return userRepository.findByIsActiveFalse()
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

}