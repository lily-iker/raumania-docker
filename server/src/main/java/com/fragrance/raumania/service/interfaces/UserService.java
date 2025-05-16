package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.dto.request.user.CreateUserRequest;
import com.fragrance.raumania.dto.request.user.UpdatePasswordRequest;
import com.fragrance.raumania.dto.request.user.UpdateUserRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.user.MyInfoResponse;
import com.fragrance.raumania.dto.response.user.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public interface UserService {

    MyInfoResponse getMyInfo();
    MyInfoResponse updateMyInfo(UpdateUserRequest request, MultipartFile imageFile) throws IOException;
    UserResponse createUser(CreateUserRequest request);
    UserResponse getUserById(UUID id);
    UserResponse updateUser(UUID id, UpdateUserRequest request);
    UUID deleteUser(UUID id);
    void updateMyPassword(UpdatePasswordRequest request);

    PageResponse<?> getAllUsers(int pageNumber, int pageSize, String sortBy, String sortDirection);
    PageResponse<?> searchUsers(int pageNumber, int pageSize, String sortBy, String sortDirection, String name);


}
