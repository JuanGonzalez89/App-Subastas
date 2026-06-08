package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "preregistraciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreRegistracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 150)
    private String apellido;

    @Column(name = "email", nullable = false, length = 250, unique = true)
    private String email;

    @Column(name = "numerodocumento", nullable = false, length = 20)
    private String numeroDocumento;

    @Column(name = "documentofrente")
    private String documentoFrente;

    @Column(name = "documentodorso")
    private String documentoDorso;

    @Column(name = "domicilio", length = 250)
    private String domicilio;

    @Column(name = "numeropais")
    private Integer numeroPais;

    @Column(name = "fechasolicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "estado", length = 15)
    private String estado;

    @PrePersist
    public void prePersist() {
        this.fechaSolicitud = LocalDateTime.now();
        if (this.estado == null) this.estado = "pendiente";
    }
}
