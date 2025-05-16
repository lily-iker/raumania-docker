package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.request.payment.CreatePaymentRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
public class StripeController {

    private final StripeService stripeService;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody CreatePaymentRequest createPaymentRequest) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                    "Payment created successfully",
                        stripeService.createPaymentFromOrder(createPaymentRequest)));
    }

    @GetMapping("/success")
    public ResponseEntity<?> verifyPayment(@RequestParam String session_id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Payment verified successfully",
                        stripeService.verifyPayment(session_id)));
    }
}
