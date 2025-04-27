package com.fragrance.raumania.repository;

import com.fragrance.raumania.model.user.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    Optional<Address> findByUserId(UUID userId);
}
