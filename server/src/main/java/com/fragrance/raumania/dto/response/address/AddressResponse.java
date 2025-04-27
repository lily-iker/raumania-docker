package com.fragrance.raumania.dto.response.address;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {
    private UUID id;
    private String houseNumber;
    private String streetName;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private UUID userId;
}

