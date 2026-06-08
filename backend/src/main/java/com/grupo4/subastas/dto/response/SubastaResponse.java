package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubastaResponse {
    private Integer id;
    private String fecha;
    private String hora;
    private String estado;
    private String ubicacion;
    private String categoria;
    private String moneda;
    private String subastador;
    private boolean puedeAcceder;
}
