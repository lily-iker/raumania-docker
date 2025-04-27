package com.fragrance.raumania.dto.request.user;

import com.fragrance.raumania.constant.role.RoleName;
import com.fragrance.raumania.validator.indentifier.Identifier;
import com.fragrance.raumania.validator.phone.PhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Builder
public class CreateUserRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 50, message = "Full name must be between 2 and 50 characters")
    private String fullName;

    @Identifier(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Identifier(message = "Username is required")
    @Size(min = 8, max = 20, message = "Username must be between 8 and 20 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Phone number is required")
    @PhoneNumber
    private String phoneNumber;

    @NotBlank(message = "Role name is required")
    private RoleName roleName;
}
