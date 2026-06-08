package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.TokenConfirmacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenConfirmacionRepository extends JpaRepository<TokenConfirmacion, Integer> {
    Optional<TokenConfirmacion> findByToken(String token);
}
