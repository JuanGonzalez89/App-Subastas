package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PujaResponse {
    private Integer id;
    private Integer asistenteId;
    private Integer numeroPostor;   // Postor #XXX (anonimizado)
    private BigDecimal monto;
    private String ganador;
    private boolean esPropio;       // true si le pertenece al usuario que consulta
}
