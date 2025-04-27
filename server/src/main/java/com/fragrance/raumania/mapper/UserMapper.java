package com.fragrance.raumania.mapper;

import com.fragrance.raumania.dto.response.user.MyInfoResponse;
import com.fragrance.raumania.dto.response.user.UserResponse;
import com.fragrance.raumania.model.user.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public MyInfoResponse toMyInfoResponse(User user) {
        if (user == null) {
            return null;
        }

        return MyInfoResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .imageUrl(user.getImageUrl())
                .role(user.getRole().getName().name())
                .emailVerified(user.getEmailVerified())
                .isActive(user.getIsActive())
                .build();
    }

    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .roleName(user.getRole().getName().name())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .build();
    }
}
