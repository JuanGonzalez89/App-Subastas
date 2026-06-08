package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Subastador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubastadorRepository extends JpaRepository<Subastador, Integer> {
}
