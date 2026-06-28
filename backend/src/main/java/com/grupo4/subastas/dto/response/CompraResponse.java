package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Un bien que el cliente ganó en una subasta. Incluye el desglose del importe a
 * pagar (lo pujado + comisiones + costo de envío) y el estado del pago.
 */
@Data
@Builder
public class CompraResponse {
    private Integer registroId;
    private Integer productoId;
    private String descripcion;
    private List<Integer> fotoIds;
    private BigDecimal importe;       // lo pujado
    private BigDecimal comision;      // comisión de la empresa
    private BigDecimal costoEnvio;    // costo de envío a la dirección declarada
    private BigDecimal total;         // importe + comision + costoEnvio
    private String moneda;
    private String estadoPago;        // pendiente | pagado | multa
    private String fechaPago;
}
