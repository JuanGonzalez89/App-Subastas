package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ProponerCondicionesRequest {

    @NotNull @Positive
    private BigDecimal valorBase;

    @NotNull @Positive
    private BigDecimal comision;

    @NotNull
    private LocalDate fechaSubasta;

    @NotNull
    private LocalTime horaSubasta;

    @NotNull
    private String lugarSubasta;
}
