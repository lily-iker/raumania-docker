package com.fragrance.raumania.repository;

import com.fragrance.raumania.constant.delivery.DeliveryStatus;
import com.fragrance.raumania.constant.order.OrderStatus;
import com.fragrance.raumania.constant.payment.PaymentStatus;
import com.fragrance.raumania.model.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    @Query("SELECT o.orderStatus, COUNT(o) FROM Order o GROUP BY o.orderStatus")
    List<Object[]> countByOrderStatus();

    @Query("SELECT o.paymentStatus, COUNT(o) FROM Order o GROUP BY o.paymentStatus")
    List<Object[]> countByPaymentStatus();

    @Query("SELECT o.deliveryStatus, COUNT(o) FROM Order o GROUP BY o.deliveryStatus")
    List<Object[]> countByDeliveryStatus();

    List<Order> findByUserId(UUID userId);

    Page<Order> findByUserId(UUID userId, Pageable pageable);


    List<Order> findByOrderStatus(OrderStatus status);
    long countByCreatedAtAfter(Date date);
    List<Order> findTop10ByOrderByCreatedAtDesc();
    List<Order> findByCreatedAtAfterAndPaymentStatus(Date date, PaymentStatus status);

}
