package com.fragrance.raumania.model.order;

import com.fragrance.raumania.model.common.AbstractAuditingEntity;
import com.fragrance.raumania.model.product.ProductVariant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;

import java.sql.Types;
import java.util.UUID;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem extends AbstractAuditingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(Types.VARCHAR)
    private UUID id;

    private Integer quantity;

    private Double unitPrice;

    private Double totalPrice;

    private String productName;

    @Column(columnDefinition = "TEXT")
    private String productDescription;

    private String productThumbnail;

    private String productVariantName;

    private String productVariantSize;

    private UUID productVariantId;

    private UUID productId;

    private String productVariantScent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
}
