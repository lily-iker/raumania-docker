package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.dto.request.address.AddressRequest;
import com.fragrance.raumania.dto.response.address.AddressResponse;

import java.util.UUID;

public interface AddressService {
    AddressResponse createAddress(AddressRequest AddressRequest) ;
    AddressResponse updateAddress(UUID id, AddressRequest AddressRequest) ;
    AddressResponse getAddressById(UUID id) ;
    UUID deleteAddress(UUID id) ;

    AddressResponse createMyAddress(AddressRequest AddressRequest) ;
    AddressResponse updateMyAddress(UUID id, AddressRequest AddressRequest) ;
    AddressResponse getMyAddress(UUID userId) ;
    UUID deleteMyAddress(UUID userId) ;

}
