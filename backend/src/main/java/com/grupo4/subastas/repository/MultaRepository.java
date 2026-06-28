package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.Multa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MultaRepository extends JpaRepository<Multa, Integer> {

    List<Multa> findByClienteIdOrderByFechaCreacionDesc(Integer clienteId);

    boolean existsByClienteIdAndEstado(Integer clienteId, String estado);

    List<Multa> findByClienteIdAndEstado(Integer clienteId, String estado);

    // Multa pendiente y todavía dentro de las 72 hs (la que efectivamente bloquea)
    boolean existsByClienteIdAndEstadoAndFechaLimiteAfter(Integer clienteId, String estado, LocalDateTime fecha);

    // Multas pendientes asociadas a una compra (registro de venta)
    List<Multa> findByRegistroIdAndEstado(Integer registroId, String estado);
}
