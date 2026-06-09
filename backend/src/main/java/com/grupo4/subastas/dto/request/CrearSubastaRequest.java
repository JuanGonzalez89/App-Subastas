package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CrearSubastaRequest {
    @NotNull
    private LocalDate fecha;

    @NotNull
    private LocalTime hora;

    @NotBlank
    private String ubicacion;

    @Positive
    private int capacidadAsistentes;

    @NotBlank
    @Pattern(regexp = "comun|especial|plata|oro|platino")
    private String categoria;

    private String moneda;
    private String tieneDeposito;
    private String seguridadPropia;
}
