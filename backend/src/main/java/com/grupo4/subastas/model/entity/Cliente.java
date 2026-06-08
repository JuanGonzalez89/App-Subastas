package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @Column(name = "numeropais")
    private Integer numeroPais;

    @Column(name = "admitido", length = 2)
    private String admitido;

    @Column(name = "categoria", length = 10)
    private String categoria;

    @Column(name = "verificador", nullable = false)
    private Integer verificador;

    @Column(name = "clavepersonal", length = 255)
    private String clavePersonal;
}
