package com.fragrance.raumania.mapper;

import com.fragrance.raumania.dto.response.address.AddressResponse;

import com.fragrance.raumania.model.user.Address;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

        public AddressResponse toAddressResponse(Address address) {
            if (address == null) {
                return null;
            }

        return AddressResponse.builder()
                .id(address.getId())
                .houseNumber(address.getHouseNumber())
                .streetName(address.getStreetName())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .userId(address.getUser().getId())
                .build();
    }
}
