package com.fragrance.raumania.dto.response.user;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class UserResponse {
    private UUID id;
    private String fullName;
    private String email;
    private String username;
    private String phoneNumber;
    private String imageUrl;
    private Boolean emailVerified;
    private Boolean isActive;
    private String roleName;
}
