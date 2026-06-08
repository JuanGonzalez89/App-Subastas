package com.grupo4.subastas.service;

import com.grupo4.subastas.dto.request.CrearProductoRequest;
import com.grupo4.subastas.dto.request.CrearSubastaRequest;
import com.grupo4.subastas.dto.request.VincularItemCatalogoRequest;
import com.grupo4.subastas.exception.CustomException;
import com.grupo4.subastas.model.entity.*;
import com.grupo4.subastas.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final SubastaRepository subastaRepository;
    private final ProductoRepository productoRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final SolicitudItemRepository solicitudItemRepository;
    private final SubastadorRepository subastadorRepository;

    private static final Integer SUBSTADOR_SISTEMA_ID = 1;

    @Transactional
    public void aprobarSolicitudItem(Integer solicitudId) {
        SolicitudItem solicitud = solicitudItemRepository.findById(solicitudId)
                .orElseThrow(() -> new CustomException("Solicitud no encontrada", HttpStatus.NOT_FOUND));

        if (!"pendiente".equals(solicitud.getEstado())) {
            throw new CustomException("La solicitud ya fue procesada", HttpStatus.BAD_REQUEST);
        }

        solicitud.setEstado("aprobado");
        solicitudItemRepository.save(solicitud);
    }

    @Transactional
    public Subasta crearSubasta(CrearSubastaRequest request) {
        Subastador subastador = subastadorRepository.findById(SUBSTADOR_SISTEMA_ID)
                .orElseThrow(() -> new CustomException("No hay subastador disponible", HttpStatus.INTERNAL_SERVER_ERROR));

        Subasta subasta = Subasta.builder()
                .fecha(request.getFecha())
                .hora(request.getHora())
                .estado("abierta")
                .subastador(subastador)
                .ubicacion(request.getUbicacion())
                .capacidadAsistentes(request.getCapacidadAsistentes())
                .tieneDeposito(request.getTieneDeposito() != null ? request.getTieneDeposito() : "no")
                .seguridadPropia(request.getSeguridadPropia() != null ? request.getSeguridadPropia() : "no")
                .categoria(request.getCategoria())
                .moneda(request.getMoneda() != null ? request.getMoneda() : "ARS")
                .build();

        return subastaRepository.save(subasta);
    }

    @Transactional
    public Producto crearProducto(CrearProductoRequest request) {
        Producto producto = Producto.builder()
                .fecha(LocalDate.now())
                .disponible("si")
                .descripcionCatalogo(request.getDescripcionCatalogo())
                .descripcionCompleta(request.getDescripcionCompleta())
                .revisor(1)
                .duenio(3)
                .build();

        return productoRepository.save(producto);
    }

    @Transactional
    public Catalogo crearCatalogo(Integer subastaId, String descripcion) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new CustomException("Subasta no encontrada", HttpStatus.NOT_FOUND));

        Catalogo catalogo = Catalogo.builder()
                .descripcion(descripcion)
                .subasta(subasta)
                .responsable(1)
                .build();

        return catalogoRepository.save(catalogo);
    }

    @Transactional
    public ItemCatalogo vincularItemAlCatalogo(Integer catalogoId, VincularItemCatalogoRequest request) {
        Catalogo catalogo = catalogoRepository.findById(catalogoId)
                .orElseThrow(() -> new CustomException("Catálogo no encontrado", HttpStatus.NOT_FOUND));

        Producto producto = productoRepository.findById(request.getProductoId())
                .orElseThrow(() -> new CustomException("Producto no encontrado", HttpStatus.NOT_FOUND));

        ItemCatalogo item = ItemCatalogo.builder()
                .catalogo(catalogo)
                .producto(producto)
                .precioBase(request.getPrecioBase())
                .comision(request.getComision())
                .subastado("no")
                .build();

        return itemCatalogoRepository.save(item);
    }
}
