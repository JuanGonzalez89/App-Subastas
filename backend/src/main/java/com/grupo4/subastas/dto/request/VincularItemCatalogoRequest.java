package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VincularItemCatalogoRequest {
    @NotNull
    private Integer productoId;

    @NotNull @Positive
    private BigDecimal precioBase;

    private BigDecimal comision;
}
