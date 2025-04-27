package com.fragrance.raumania.dto.response.order;

import com.fragrance.raumania.constant.delivery.DeliveryMethod;
import com.fragrance.raumania.constant.delivery.DeliveryStatus;
import com.fragrance.raumania.constant.order.OrderStatus;
import com.fragrance.raumania.constant.payment.PaymentMethod;
import com.fragrance.raumania.constant.payment.PaymentStatus;
import com.fragrance.raumania.dto.response.address.AddressResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class OrderResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private Double totalAmount;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private DeliveryMethod deliveryMethod;
    private DeliveryStatus deliveryStatus;
    private Double deliveryFee;
    private List<OrderItemResponse> orderItems;
    private String houseNumber;
    private String streetName;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private Date createdAt;
    private Date updatedAt;
}