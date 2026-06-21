package com.selacafe.core_service.service;

import com.selacafe.core_service.entity.User;
import com.selacafe.core_service.payload.req.LoginReq;
import com.selacafe.core_service.payload.req.RegisterReq;
import com.selacafe.core_service.payload.res.LoginRes;

public interface AuthService {
    void register(RegisterReq request);
    LoginRes login(LoginReq request);
    User getCurrentUser();
}
