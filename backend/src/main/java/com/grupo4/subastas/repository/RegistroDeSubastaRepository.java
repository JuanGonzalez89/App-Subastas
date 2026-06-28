package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.RegistroDeSubasta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistroDeSubastaRepository extends JpaRepository<RegistroDeSubasta, Integer> {

    List<RegistroDeSubasta> findByClienteIdOrderByIdentificadorDesc(Integer clienteId);
}
