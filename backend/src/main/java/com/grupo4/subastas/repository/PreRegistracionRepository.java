package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.PreRegistracion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PreRegistracionRepository extends JpaRepository<PreRegistracion, Integer> {
    boolean existsByEmail(String email);
    Optional<PreRegistracion> findByEmail(String email);
    List<PreRegistracion> findAllByEstado(String estado);
}
