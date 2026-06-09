package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.SolicitudItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudItemRepository extends JpaRepository<SolicitudItem, Integer> {

    List<SolicitudItem> findByClienteIdOrderByFechaSolicitudDesc(Integer clienteId);

    List<SolicitudItem> findAllByOrderByFechaSolicitudDesc();
}
