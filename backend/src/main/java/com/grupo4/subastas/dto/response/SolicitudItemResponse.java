package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class SolicitudItemResponse {

    private Integer id;
    private String descripcion;
    private String descripcionCompleta;
    private BigDecimal precioSugerido;
    private String estado;
    private LocalDate fechaSolicitud;
}
