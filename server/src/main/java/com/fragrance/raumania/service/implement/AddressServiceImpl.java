package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.dto.request.address.AddressRequest;
import com.fragrance.raumania.dto.response.address.AddressResponse;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.mapper.AddressMapper;
import com.fragrance.raumania.model.user.Address;
import com.fragrance.raumania.model.user.User;
import com.fragrance.raumania.repository.AddressRepository;
import com.fragrance.raumania.repository.UserRepository;
import com.fragrance.raumania.service.interfaces.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
@RequiredArgsConstructor
@Service
public class AddressServiceImpl implements AddressService {
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;
    @Override
    public AddressResponse createAddress(AddressRequest AddressRequest) {

        User user = userRepository.findById(AddressRequest.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address address = Address.builder()
                .houseNumber(AddressRequest.getHouseNumber())
                .streetName(AddressRequest.getStreetName())
                .city(AddressRequest.getCity())
                .state(AddressRequest.getState())
                .country(AddressRequest.getCountry())
                .postalCode(AddressRequest.getPostalCode())
                .user(user)
                .build();

        Address savedAddress = addressRepository.save(address);
        return addressMapper.toAddressResponse(savedAddress);
    }

    @Override
    public AddressResponse updateAddress(UUID id, AddressRequest addressRequest) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Address not found"));

        // Update address details
        address.setHouseNumber(addressRequest.getHouseNumber());
        address.setStreetName(addressRequest.getStreetName());
        address.setCity(addressRequest.getCity());
        address.setState(addressRequest.getState());
        address.setCountry(addressRequest.getCountry());
        address.setPostalCode(addressRequest.getPostalCode());

        Address updatedAddress = addressRepository.save(address);

        return addressMapper.toAddressResponse(updatedAddress);
    }


    @Override
    public AddressResponse getAddressById(UUID id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        return addressMapper.toAddressResponse(address);
    }

    @Override
    public UUID deleteAddress(UUID id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);

        return id;
    }

    @Override
    public AddressResponse createMyAddress(AddressRequest addressRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUserName)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));


        if (!currentUser.getId().equals(addressRequest.getUserId())) {
            throw new IllegalStateException("The user ID in the address request does not match the currently authenticated user.");
        }

        Address address = Address.builder()
                .houseNumber(addressRequest.getHouseNumber())
                .streetName(addressRequest.getStreetName())
                .city(addressRequest.getCity())
                .state(addressRequest.getState())
                .country(addressRequest.getCountry())
                .postalCode(addressRequest.getPostalCode())
                .user(currentUser)
                .build();

        Address savedAddress = addressRepository.save(address);
        return addressMapper.toAddressResponse(savedAddress);
    }

    @Override
    public AddressResponse updateMyAddress(UUID id, AddressRequest addressRequest) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(addressRequest.getUserId())) {
            throw new IllegalStateException("This address does not belong to the user.");
        }

        address.setHouseNumber(addressRequest.getHouseNumber());
        address.setStreetName(addressRequest.getStreetName());
        address.setCity(addressRequest.getCity());
        address.setState(addressRequest.getState());
        address.setCountry(addressRequest.getCountry());
        address.setPostalCode(addressRequest.getPostalCode());

        Address updatedAddress = addressRepository.save(address);
        return addressMapper.toAddressResponse(updatedAddress);
    }

    @Override
    public AddressResponse getMyAddress(UUID userId) {
        Address address = addressRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found for this user"));

        return addressMapper.toAddressResponse(address);
    }


    @Override
    public UUID deleteMyAddress(UUID userId) {
        Address address = addressRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found for this user"));
        addressRepository.delete(address);
        return userId;
    }
}
