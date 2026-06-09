package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "duenios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Duenio {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "numeropais")
    private Integer numeroPais;

    @Column(name = "verificacionfinanciera", length = 2)
    private String verificacionFinanciera;

    @Column(name = "verificacionjudicial", length = 2)
    private String verificacionJudicial;

    @Column(name = "calificacionriesgo")
    private Integer calificacionRiesgo;

    @Column(name = "verificador", nullable = false)
    private Integer verificador;
}
