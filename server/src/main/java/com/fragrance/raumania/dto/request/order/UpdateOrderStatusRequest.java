package com.fragrance.raumania.dto.request.order;

import com.fragrance.raumania.constant.delivery.DeliveryStatus;
import com.fragrance.raumania.constant.order.OrderStatus;
import com.fragrance.raumania.constant.payment.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private DeliveryStatus deliveryStatus;
}
