package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PreRegistracionResponse {
    private Integer id;
    private String nombre;
    private String apellido;
    private String email;
    private String estado;
    private LocalDateTime fechaSolicitud;
}
