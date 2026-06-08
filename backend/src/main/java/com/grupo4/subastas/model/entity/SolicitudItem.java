package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "solicitudes_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "cliente", nullable = false)
    private Integer clienteId;

    @Column(name = "descripcion", nullable = false, length = 500)
    private String descripcion;

    @Column(name = "descripcion_completa", length = 500)
    private String descripcionCompleta;

    @Column(name = "precio_sugerido", precision = 18, scale = 2)
    private BigDecimal precioSugerido;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "fecha_solicitud")
    private LocalDate fechaSolicitud;

    @PrePersist
    public void prePersist() {
        if (estado == null) estado = "pendiente";
        if (fechaSolicitud == null) fechaSolicitud = LocalDate.now();
    }
}
