package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "asistentes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asistente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "numeropostor", nullable = false)
    private Integer numeroPostor;

    @Column(name = "cliente", nullable = false)
    private Integer clienteId;

    @Column(name = "subasta", nullable = false)
    private Integer subastaId;
}
