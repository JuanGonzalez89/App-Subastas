package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "subastas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora")
    private LocalTime hora;

    @Column(name = "estado", length = 10)
    private String estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subastador")
    private Subastador subastador;

    @Column(name = "ubicacion", length = 350)
    private String ubicacion;

    @Column(name = "capacidadasistentes")
    private Integer capacidadAsistentes;

    @Column(name = "tienedeposito", length = 2)
    private String tieneDeposito;

    @Column(name = "seguridadpropia", length = 2)
    private String seguridadPropia;

    @Column(name = "categoria", length = 10)
    private String categoria;

    @Column(name = "moneda", length = 3)
    private String moneda;
}
