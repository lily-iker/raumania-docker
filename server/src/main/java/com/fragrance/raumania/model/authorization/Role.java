package com.fragrance.raumania.model.authorization;

import com.fragrance.raumania.constant.role.RoleName;
import com.fragrance.raumania.model.common.AbstractAuditingEntity;
import com.fragrance.raumania.model.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends AbstractAuditingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    private RoleName name;

    @Builder.Default
    @OneToMany(mappedBy = "role")
    private Set<User> users = new HashSet<>();
}

