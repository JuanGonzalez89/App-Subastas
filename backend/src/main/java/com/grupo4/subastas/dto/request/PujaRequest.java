package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PujaRequest {

    @NotNull
    private Integer itemId;

    @NotNull
    @Positive
    private BigDecimal monto;
}
