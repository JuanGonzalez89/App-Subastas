package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "solicitudes_fotos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudFoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "solicitud_item", nullable = false)
    private Integer solicitudItemId;

    @Column(name = "foto")
    private byte[] foto;

    @Column(name = "orden")
    private Integer orden;
}
