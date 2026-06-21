package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.entity.Role;
import com.selacafe.core_service.payload.res.RoleRes;
import com.selacafe.core_service.repository.RoleRepository;
import com.selacafe.core_service.service.RoleService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    private RoleRes mapToResponse(Role role) {

        return RoleRes.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .build();
    }

    @Override
    public List<RoleRes> getAllRoles() {

        return roleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}