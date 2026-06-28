package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Resultado de intentar pagar un bien ganado.
 * Si el medio de pago no alcanza a cubrir el total, se genera una multa del 10%
 * y el cliente tiene 72 hs para presentar los fondos.
 */
@Data
@Builder
public class PagoResultResponse {
    private boolean pagado;            // true si el pago se completó
    private String mensaje;
    private boolean multaGenerada;     // true si se generó una multa
    private BigDecimal multaImporte;
    private String fechaLimite;        // límite de 72 hs para presentar fondos
    private CompraResponse compra;
}
