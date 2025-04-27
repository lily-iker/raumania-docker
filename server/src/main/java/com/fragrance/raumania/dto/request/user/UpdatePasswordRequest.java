package com.fragrance.raumania.dto.request.user;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UpdatePasswordRequest {
    private String currentPassword;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;

    @Size(min = 8, message = "Confirm-Password must be at least 8 characters")
    private String confirmPassword;
}
