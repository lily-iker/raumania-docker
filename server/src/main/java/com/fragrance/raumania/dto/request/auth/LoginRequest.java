package com.fragrance.raumania.dto.request.auth;

import com.fragrance.raumania.validator.indentifier.Identifier;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginRequest {

    @Identifier
    private String identifier;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
