package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {

    Optional<Asistente> findByClienteIdAndSubastaId(Integer clienteId, Integer subastaId);

    int countBySubastaId(Integer subastaId);

    List<Asistente> findByClienteId(Integer clienteId);

    // Detecta si el cliente ya está en UNA SUBASTA DISTINTA que esté actualmente abierta
    @Query("""
        SELECT COUNT(a) > 0 FROM Asistente a
        JOIN Subasta s ON s.identificador = a.subastaId
        WHERE a.clienteId = :clienteId
          AND a.subastaId <> :subastaId
          AND s.estado = 'abierta'
        """)
    boolean existeClienteEnOtraSubastaAbierta(
        @Param("clienteId") Integer clienteId,
        @Param("subastaId") Integer subastaId
    );
}
