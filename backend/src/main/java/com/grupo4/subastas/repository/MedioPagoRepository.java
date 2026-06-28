package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.MedioPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedioPagoRepository extends JpaRepository<MedioPago, Integer> {
    List<MedioPago> findByClienteId(Integer clienteId);

    boolean existsByClienteIdAndVerificado(Integer clienteId, String verificado);

    List<MedioPago> findAllByVerificado(String verificado);

    // Monto garantizado máximo de cheques certificados verificados del cliente
    @Query("SELECT MAX(m.montoGarantizado) FROM MedioPago m WHERE m.clienteId = :clienteId AND m.tipo = 'cheque_certificado' AND m.verificado = 'si'")
    Optional<BigDecimal> findMaxMontoGarantizadoCheque(@Param("clienteId") Integer clienteId);
}
