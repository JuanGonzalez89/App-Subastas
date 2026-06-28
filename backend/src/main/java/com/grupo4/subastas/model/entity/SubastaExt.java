package com.grupo4.subastas.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subastas_ext")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubastaExt {

    @Id
    @Column(name = "subasta")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "subasta")
    private Subasta subasta;

    @Column(name = "moneda", length = 3)
    private String moneda;
}
