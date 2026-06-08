package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "disponible", length = 2)
    private String disponible;

    @Column(name = "descripcioncatalogo", length = 500)
    private String descripcionCatalogo;

    @Column(name = "descripcioncompleta", length = 300)
    private String descripcionCompleta;

    @Column(name = "revisor")
    private Integer revisor;

    @Column(name = "duenio")
    private Integer duenio;

    @Column(name = "seguro", length = 30)
    private String seguro;
}
