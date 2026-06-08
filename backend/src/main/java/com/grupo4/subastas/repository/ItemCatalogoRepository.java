package com.grupo4.subastas.repository;

import com.grupo4.subastas.model.entity.ItemCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {

    @Query("SELECT ic FROM ItemCatalogo ic JOIN FETCH ic.producto WHERE ic.catalogo.identificador = :catalogoId")
    List<ItemCatalogo> findByCatalogoWithProducto(@Param("catalogoId") Integer catalogoId);
}
