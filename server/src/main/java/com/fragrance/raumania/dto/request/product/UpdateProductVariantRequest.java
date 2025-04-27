package com.fragrance.raumania.dto.request.product;

import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class UpdateProductVariantRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Size is required")
    private String size;

    @NotBlank(message = "Scent is required")
    private String scent;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock must be a non-negative integer")
    private Integer stock;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private Double price;

}
