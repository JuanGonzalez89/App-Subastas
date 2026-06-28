package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

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

    @Column(name = "estado", length = 30)
    private String estado;

    @Column(name = "fecha_solicitud")
    private LocalDate fechaSolicitud;

    // Etapa 2: empresa interesada
    @Column(name = "direccion_envio", length = 250)
    private String direccionEnvio;

    // Etapa 3: resultado de inspección
    @Column(name = "motivo_rechazo", length = 500)
    private String motivoRechazo;

    // Etapa 4: condiciones propuestas por la empresa
    @Column(name = "valor_base", precision = 18, scale = 2)
    private BigDecimal valorBase;

    @Column(name = "comision", precision = 5, scale = 2)
    private BigDecimal comision;

    @Column(name = "fecha_subasta")
    private LocalDate fechaSubasta;

    @Column(name = "hora_subasta")
    private LocalTime horaSubasta;

    @Column(name = "lugar_subasta", length = 250)
    private String lugarSubasta;

    // Etapa 6: seguro y depósito
    @Column(name = "deposito_ubicacion", length = 250)
    private String depositoUbicacion;

    @Column(name = "poliza_seguro", length = 250)
    private String polizaSeguro;

    @PrePersist
    public void prePersist() {
        if (estado == null) estado = "pendiente";
        if (fechaSolicitud == null) fechaSolicitud = LocalDate.now();
    }
}
