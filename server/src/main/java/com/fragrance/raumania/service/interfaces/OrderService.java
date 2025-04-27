package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.constant.payment.PaymentStatus;
import com.fragrance.raumania.dto.request.checkout.CheckoutRequest;
import com.fragrance.raumania.dto.request.order.UpdateOrderStatusRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.order.OrderResponse;

import java.util.UUID;

public interface OrderService {
    void updatePaymentStatus(UUID orderId, PaymentStatus paymentStatus);

    OrderResponse createOrderFromSelectedCartItems(CheckoutRequest checkoutRequest);

    Object getAllOrdersStatusCounts();

    PageResponse<?> getOrdersForCurrentUser(int pageNumber, int pageSize, String sortBy, String sortDirection);

    OrderResponse getOrderById(UUID orderId);
    UUID deleteOrder(UUID orderId);
    OrderResponse updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request);

    PageResponse<?> getAllOrders(int pageNumber, int pageSize, String sortBy, String sortDirection);


}