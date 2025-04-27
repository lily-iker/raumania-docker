package com.fragrance.raumania.dto.response.order;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public  class OrderItemResponse {
    private UUID id;

    private UUID productId;

    private UUID productVariantId;

    private String productName;

    private String productThumbnail;

    private String productVariantSize;

    private String productVariantScent;

    private Integer quantity;

    private Double totalPrice;

    private String productDescription;

    private Double unitPrice;

    private String productVariantName;

}
