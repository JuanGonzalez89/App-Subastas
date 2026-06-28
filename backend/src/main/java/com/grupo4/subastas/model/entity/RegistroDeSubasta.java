package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Registro de la venta de un bien en una subasta (el comprador ganó la puja).
 * Las columnas estado_pago, costo_envio, medio_pago y fecha_pago son una
 * extensión para gestionar el pago de lo adquirido desde la app.
 */
@Entity
@Table(name = "registrodesubasta")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroDeSubasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "subasta", nullable = false)
    private Integer subastaId;

    @Column(name = "duenio", nullable = false)
    private Integer duenioId;

    @Column(name = "producto", nullable = false)
    private Integer productoId;

    @Column(name = "cliente", nullable = false)
    private Integer clienteId;

    @Column(name = "importe", precision = 18, scale = 2, nullable = false)
    private BigDecimal importe;

    @Column(name = "comision", precision = 18, scale = 2, nullable = false)
    private BigDecimal comision;

    // ── Extensión: gestión del pago ──
    @Column(name = "costo_envio", precision = 18, scale = 2)
    private BigDecimal costoEnvio;

    @Column(name = "estado_pago", length = 15)
    private String estadoPago;

    @Column(name = "medio_pago")
    private Integer medioPagoId;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @PrePersist
    public void prePersist() {
        if (estadoPago == null) estadoPago = "pendiente";
    }
}
