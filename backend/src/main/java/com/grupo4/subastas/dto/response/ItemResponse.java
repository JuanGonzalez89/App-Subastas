package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ItemResponse {
    private Integer id;
    private Integer numeroPieza;
    private String descripcion;
    private BigDecimal precioBase;
    private String subastado;
    private List<Integer> fotoIds;
    private String descripcionCompleta;
}
