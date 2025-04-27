package com.fragrance.raumania.dto.response.user;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class MyInfoResponse {
    private UUID id;
    private String fullName;
    private String username;
    private String email;
    private String phoneNumber;
    private String imageUrl;
    private String role;
    private Boolean emailVerified;
    private Boolean isActive;
}
