package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.constant.payment.PaymentStatus;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.model.payment.Payment;
import com.fragrance.raumania.repository.PaymentRepository;
import com.fragrance.raumania.service.interfaces.PaymentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public void updatePaymentStatus(UUID paymentId, PaymentStatus paymentStatus) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.setPaymentStatus(paymentStatus);
    }
}
