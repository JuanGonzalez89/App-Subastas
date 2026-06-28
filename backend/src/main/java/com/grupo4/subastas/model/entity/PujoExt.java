package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "pujos_ext")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PujoExt {

    @Id
    @Column(name = "pujo")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "pujo")
    private Pujo pujo;

    @Column(name = "fechahora")
    private LocalDateTime fechahora;

    @PrePersist
    public void prePersist() {
        if (fechahora == null) fechahora = LocalDateTime.now();
    }
}
