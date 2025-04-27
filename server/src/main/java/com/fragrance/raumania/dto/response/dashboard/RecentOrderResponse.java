package com.fragrance.raumania.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
public class RecentOrderResponse {
    private UUID id;
    private String customerName;
    private Date orderDate;
    private Double totalAmount;
    private String status;
    private String paymentStatus;
}