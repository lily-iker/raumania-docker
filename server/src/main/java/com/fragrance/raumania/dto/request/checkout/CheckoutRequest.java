package com.fragrance.raumania.dto.request.checkout;

import com.fragrance.raumania.constant.delivery.DeliveryMethod;
import com.fragrance.raumania.constant.payment.PaymentMethod;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CheckoutRequest {
    private List<UUID> cartItemIds;
    private DeliveryMethod deliveryMethod;
    private PaymentMethod paymentMethod;
    private String houseNumber;
    private String streetName;
    private String city;
    private String state;
    private String country;
    private String postalCode;
}