package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "mediospago")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedioPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "cliente", nullable = false)
    private Integer clienteId;

    @Column(nullable = false, length = 30)
    private String tipo;

    @Column(nullable = false, length = 150)
    private String entidad;

    @Column(nullable = false, length = 100)
    private String numero;

    @Column(name = "montogarantizado", precision = 18, scale = 2)
    private BigDecimal montoGarantizado;

    @Column(length = 2)
    private String verificado;

    @PrePersist
    public void prePersist() {
        if (verificado == null) verificado = "no";
    }
}
