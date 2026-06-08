package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Subasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubastaRepository extends JpaRepository<Subasta, Integer> {

    @Query("SELECT s FROM Subasta s LEFT JOIN FETCH s.subastador sub LEFT JOIN FETCH sub.persona")
    List<Subasta> findAllWithSubastador();

    @Query("SELECT s FROM Subasta s LEFT JOIN FETCH s.subastador sub LEFT JOIN FETCH sub.persona WHERE s.categoria = :categoria")
    List<Subasta> findByCategoriaWithSubastador(@Param("categoria") String categoria);

    @Query("SELECT s FROM Subasta s LEFT JOIN FETCH s.subastador sub LEFT JOIN FETCH sub.persona WHERE s.identificador = :id")
    Optional<Subasta> findByIdWithSubastador(@Param("id") Integer id);
}
