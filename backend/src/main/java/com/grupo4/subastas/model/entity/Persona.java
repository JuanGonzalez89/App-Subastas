package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "personas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "documento", nullable = false, length = 20)
    private String documento;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "direccion", length = 250)
    private String direccion;

    @Column(name = "estado", length = 15)
    private String estado;

    @Column(name = "foto")
    private byte[] foto;
}
