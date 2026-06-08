package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonaRepository extends JpaRepository<Persona, Integer> {
    Optional<Persona> findByEmail(String email);
    boolean existsByEmail(String email);
}
