package com.selacafe.core_service.service;

import java.util.List;

import com.selacafe.core_service.payload.req.UpdateProfileReq;
import com.selacafe.core_service.payload.res.UserRes;

public interface UserService {
    UserRes getProfile();
    List<UserRes> getAllUsers();
    UserRes getUserById(Long id);
    UserRes updateRole(Long userId, String roleName);
    UserRes activate(Long id);
    UserRes deactivate(Long id);
    UserRes updateProfile(UpdateProfileReq request);
    List<UserRes> searchUsers(String keyword);
    List<UserRes> getActiveUsers();
    List<UserRes> getInactiveUsers();
}