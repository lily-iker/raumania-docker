package com.fragrance.raumania.dto.request.user;

import com.fragrance.raumania.validator.phone.PhoneNumber;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    @Size(min = 2, max = 50, message = "Full name must be between 2 and 50 characters")
    private String fullName;

    @PhoneNumber
    private String phoneNumber;

    private String imageUrl;
    private Boolean isActive;
}

