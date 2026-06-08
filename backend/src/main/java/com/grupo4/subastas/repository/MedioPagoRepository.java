package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.MedioPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedioPagoRepository extends JpaRepository<MedioPago, Integer> {
    List<MedioPago> findByClienteId(Integer clienteId);

    // Verifica si el cliente tiene AL MENOS UN medio de pago verificado
    boolean existsByClienteIdAndVerificado(Integer clienteId, String verificado);
}
