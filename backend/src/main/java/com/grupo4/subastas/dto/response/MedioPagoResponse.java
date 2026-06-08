package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class MedioPagoResponse {
    private Integer id;
    private String tipo;
    private String entidad;
    private String numero;
    private BigDecimal montoGarantizado;
    private String verificado;
}
