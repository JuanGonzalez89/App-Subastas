package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fotos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Foto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto")
    private Producto producto;

    // Sin @Lob: la columna es bytea. Con @Lob, PostgreSQL lo trata como Large
    // Object (OID/bigint) y falla al insertar/leer en una columna bytea.
    @Column(name = "foto")
    private byte[] foto;
}
