package com.fragrance.raumania.dto.response.token;

import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;
import java.util.UUID;

@Builder
@Getter
public class TokenResponse implements Serializable {
    private String accessToken;
    private String refreshToken;
    private UUID userId;
}
