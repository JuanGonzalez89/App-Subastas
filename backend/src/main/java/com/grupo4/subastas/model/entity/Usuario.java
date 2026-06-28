package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @Column(name = "apellido", length = 150)
    private String apellido;

    @Column(name = "email", length = 250, unique = true)
    private String email;

    @Column(name = "clavepersonal", length = 255)
    private String clavePersonal;

    @Column(name = "rol", length = 10)
    private String rol;
}
