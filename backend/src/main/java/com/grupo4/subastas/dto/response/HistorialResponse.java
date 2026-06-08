package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class HistorialResponse {

    private int subastasAsistidas;
    private long subastasGanadas;
    private BigDecimal importeTotalOfertado;

    private List<PujaHistorialItem> pujas;

    @Data
    @Builder
    public static class PujaHistorialItem {
        private Integer pujaId;
        private Integer subastaId;
        private Integer itemId;
        private BigDecimal monto;
        private String ganador;
    }
}
