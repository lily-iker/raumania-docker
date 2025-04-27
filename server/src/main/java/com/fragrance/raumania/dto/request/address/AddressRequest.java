package com.fragrance.raumania.dto.request.address;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {
    private String houseNumber;
    private String streetName;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private UUID userId;
}
