package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    @Query("SELECT c FROM Cliente c JOIN c.persona p WHERE p.email = :email")
    Optional<Cliente> findByPersonaEmail(@Param("email") String email);
}
