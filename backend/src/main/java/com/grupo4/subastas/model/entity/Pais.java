package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "paises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pais {

    @Id
    @Column(name = "numero")
    private Integer numero;

    @Column(name = "nombre", length = 250)
    private String nombre;
}
