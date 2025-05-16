package com.fragrance.raumania.dto.response.stripe;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class StripeResponse<T> {
    private String status;
    private String message;
    private Integer httpStatus;
    private T data;
}
