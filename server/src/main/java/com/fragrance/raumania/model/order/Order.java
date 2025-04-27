package com.fragrance.raumania.model.order;

import com.fragrance.raumania.constant.order.OrderStatus;
import com.fragrance.raumania.constant.payment.PaymentStatus;
import com.fragrance.raumania.constant.delivery.DeliveryMethod;
import com.fragrance.raumania.constant.delivery.DeliveryStatus;
import com.fragrance.raumania.model.common.AbstractAuditingEntity;
import com.fragrance.raumania.model.payment.Payment;
import com.fragrance.raumania.model.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;

import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "orders")
public class Order extends AbstractAuditingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(Types.VARCHAR)
    private UUID id;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    private DeliveryMethod deliveryMethod;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus;

    private Double deliveryFee;

    private String houseNumber;

    private String streetName;

    private String city;

    private String state;

    private String country;

    private String postalCode;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment ;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
