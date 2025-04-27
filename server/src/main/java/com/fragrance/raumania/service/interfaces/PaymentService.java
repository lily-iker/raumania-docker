package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.constant.payment.PaymentStatus;

import java.util.UUID;

public interface PaymentService {
     void updatePaymentStatus(UUID paymentId, PaymentStatus paymentStatus);
}
