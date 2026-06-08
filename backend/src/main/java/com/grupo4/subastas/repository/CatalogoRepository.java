package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Catalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CatalogoRepository extends JpaRepository<Catalogo, Integer> {

    @Query("SELECT c FROM Catalogo c WHERE c.subasta.identificador = :subastaId")
    Optional<Catalogo> findBySubastaId(@Param("subastaId") Integer subastaId);
}
