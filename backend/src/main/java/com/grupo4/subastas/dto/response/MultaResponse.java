package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class MultaResponse {
    private Integer id;
    private BigDecimal importe;
    private String motivo;
    private String estado;       // pendiente | pagada
    private String fechaLimite;
    private String fechaCreacion;
}
