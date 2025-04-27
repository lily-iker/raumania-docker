package com.fragrance.raumania.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
@Getter
public class ProductIndexEvent {
    private final UUID productId;
    private final Operation operation;

    public enum Operation {
        CREATE, UPDATE, DELETE
    }
}