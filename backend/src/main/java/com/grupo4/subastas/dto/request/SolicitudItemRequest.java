package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SolicitudItemRequest {

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    private String descripcionCompleta;

    @Positive(message = "El precio sugerido debe ser positivo")
    private BigDecimal precioSugerido;
}
