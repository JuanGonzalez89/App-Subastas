package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pujos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pujo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "asistente", nullable = false)
    private Integer asistenteId;

    @Column(name = "item", nullable = false)
    private Integer itemId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(length = 2)
    private String ganador;

    @Column(name = "fechahora")
    private LocalDateTime fechahora;

    @PrePersist
    public void prePersist() {
        if (ganador == null) ganador = "no";
        if (fechahora == null) fechahora = LocalDateTime.now();
    }
}
