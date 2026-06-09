package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.SolicitudFoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SolicitudFotoRepository extends JpaRepository<SolicitudFoto, Integer> {

    List<SolicitudFoto> findBySolicitudItemIdOrderByOrdenAsc(Integer solicitudItemId);

    @Query("SELECT sf.identificador FROM SolicitudFoto sf WHERE sf.solicitudItemId = :solicitudItemId ORDER BY sf.orden")
    List<Integer> findIdsBySolicitudItemId(@Param("solicitudItemId") Integer solicitudItemId);
}
