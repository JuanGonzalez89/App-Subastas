package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonaRepository extends JpaRepository<Persona, Integer> {
}
