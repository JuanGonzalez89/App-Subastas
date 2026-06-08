package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokensconfirmacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenConfirmacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "clienteid", nullable = false)
    private Integer clienteId;

    @Column(name = "token", nullable = false, unique = true, length = 100)
    private String token;

    @Column(name = "fechaexpiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    @Column(name = "usado", length = 2)
    private String usado;

    @PrePersist
    public void prePersist() {
        if (this.usado == null) this.usado = "no";
    }
}
