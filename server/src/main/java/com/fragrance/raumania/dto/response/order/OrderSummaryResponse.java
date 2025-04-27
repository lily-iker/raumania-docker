package com.fragrance.raumania.dto.response.order;

import com.fragrance.raumania.constant.delivery.DeliveryStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
public class OrderSummaryResponse {
    private UUID orderId;
    private String productVariantName;
    private String productVariantSize;
    private String productVariantScent;
    private Integer quantity;
    private DeliveryStatus deliveryStatus;
    private Double totalAmount;
    private Date createdAt;
}