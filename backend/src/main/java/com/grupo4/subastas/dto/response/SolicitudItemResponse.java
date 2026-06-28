package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class SolicitudItemResponse {

    private Integer id;
    private String descripcion;
    private String descripcionCompleta;
    private BigDecimal precioSugerido;
    private String estado;
    private LocalDate fechaSolicitud;
    private List<Integer> fotoIds;

    // Etapa 2
    private String direccionEnvio;

    // Etapa 3
    private String motivoRechazo;

    // Etapa 4
    private BigDecimal valorBase;
    private BigDecimal comision;
    private LocalDate fechaSubasta;
    private LocalTime horaSubasta;
    private String lugarSubasta;

    // Etapa 6
    private String depositoUbicacion;
    private String polizaSeguro;
}
