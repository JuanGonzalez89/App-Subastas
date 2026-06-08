package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Pujo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PujoRepository extends JpaRepository<Pujo, Integer> {

    // Todas las pujas de un item, ordenadas de mayor a menor importe
    List<Pujo> findByItemIdOrderByImporteDesc(Integer itemId);

    // Mayor oferta actual para un item
    @Query("SELECT MAX(p.importe) FROM Pujo p WHERE p.itemId = :itemId")
    Optional<BigDecimal> findMaxImporteByItemId(@Param("itemId") Integer itemId);

    // Verificar si un asistente ya pujó en un item
    boolean existsByAsistenteIdAndItemId(Integer asistenteId, Integer itemId);

    // Todas las pujas de una lista de asistentes (para historial)
    List<Pujo> findByAsistenteIdIn(List<Integer> asistenteIds);

    // Suma total ofertada por una lista de asistentes
    @Query("SELECT COALESCE(SUM(p.importe), 0) FROM Pujo p WHERE p.asistenteId IN :ids")
    BigDecimal sumImporteByAsistenteIds(@Param("ids") List<Integer> ids);

    // Cantidad de subastas ganadas (donde al menos una puja del asistente es ganadora)
    @Query("SELECT COUNT(DISTINCT p.asistenteId) FROM Pujo p WHERE p.asistenteId IN :ids AND p.ganador = 'si'")
    long countGanadasByAsistenteIds(@Param("ids") List<Integer> ids);
}
