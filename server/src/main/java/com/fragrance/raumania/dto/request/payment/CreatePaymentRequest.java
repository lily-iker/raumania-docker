package com.fragrance.raumania.dto.request.payment;

import lombok.Data;

import java.util.UUID;

@Data

public class CreatePaymentRequest {
    private UUID orderId;
}
