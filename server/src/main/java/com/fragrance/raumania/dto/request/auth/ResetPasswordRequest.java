package com.fragrance.raumania.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Builder

public class ResetPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Token is required")
    private String token;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String confirmPassword;
}
