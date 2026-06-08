package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FotoRepository extends JpaRepository<Foto, Integer> {

    @Query("SELECT f.identificador FROM Foto f WHERE f.producto.identificador = :productoId")
    List<Integer> findIdsByProductoId(@Param("productoId") Integer productoId);
}
