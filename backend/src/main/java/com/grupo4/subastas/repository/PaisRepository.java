package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Pais;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaisRepository extends JpaRepository<Pais, Integer> {
    boolean existsByNumero(Integer numero);
}
