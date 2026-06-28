package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Multa aplicada a un cliente cuando, al momento de pagar un bien ganado, no
 * posee los fondos suficientes (documento: multa del 10% del valor ofertado +
 * 72 hs para presentar los fondos). Mientras tenga una multa pendiente, el
 * cliente no puede participar en otra subasta.
 */
@Entity
@Table(name = "multas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Multa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "cliente", nullable = false)
    private Integer clienteId;

    @Column(name = "importe", precision = 18, scale = 2, nullable = false)
    private BigDecimal importe;

    @Column(name = "motivo", length = 300)
    private String motivo;

    @Column(name = "estado", length = 15)
    private String estado;

    @Column(name = "fecha_limite")
    private LocalDateTime fechaLimite;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "registro")
    private Integer registroId;

    @PrePersist
    public void prePersist() {
        if (estado == null) estado = "pendiente";
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
    }
}
