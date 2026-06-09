package com.grupo4.subastas.service;

import com.grupo4.subastas.dto.request.CrearProductoRequest;
import com.grupo4.subastas.dto.request.CrearSubastaRequest;
import com.grupo4.subastas.dto.request.VincularItemCatalogoRequest;
import com.grupo4.subastas.dto.response.MedioPagoResponse;
import com.grupo4.subastas.dto.response.PreRegistracionResponse;
import com.grupo4.subastas.dto.response.SolicitudItemResponse;
import com.grupo4.subastas.exception.CustomException;
import com.grupo4.subastas.model.entity.*;
import com.grupo4.subastas.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final SubastaRepository subastaRepository;
    private final ProductoRepository productoRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final SolicitudItemRepository solicitudItemRepository;
    private final SolicitudFotoRepository solicitudFotoRepository;
    private final SubastadorRepository subastadorRepository;
    private final PreRegistracionRepository preRegistracionRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final DuenioRepository duenioRepository;

    private static final Integer SUBASTADOR_SISTEMA_ID = 1;

    public List<SolicitudItemResponse> listarSolicitudes() {
        return solicitudItemRepository.findAllByOrderByFechaSolicitudDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void aprobarSolicitudItem(Integer solicitudId) {
        SolicitudItem solicitud = solicitudItemRepository.findById(solicitudId)
                .orElseThrow(() -> new CustomException("Solicitud no encontrada", HttpStatus.NOT_FOUND));

        if (!"pendiente".equals(solicitud.getEstado())) {
            throw new CustomException("La solicitud ya fue procesada", HttpStatus.BAD_REQUEST);
        }

        solicitud.setEstado("aprobado");
        solicitudItemRepository.save(solicitud);

        Integer duenioId = solicitud.getClienteId();
        if (!duenioRepository.existsById(duenioId)) {
            Duenio nuevoDuenio = Duenio.builder()
                    .identificador(duenioId)
                    .verificador(1)
                    .verificacionFinanciera("no")
                    .verificacionJudicial("no")
                    .calificacionRiesgo(3)
                    .build();
            duenioRepository.save(nuevoDuenio);
        }

        String descCatalogo = solicitud.getDescripcion();
        if (descCatalogo != null && descCatalogo.length() > 300) {
            descCatalogo = descCatalogo.substring(0, 300);
        }
        String descCompleta = solicitud.getDescripcionCompleta();
        if (descCompleta != null && descCompleta.length() > 300) {
            descCompleta = descCompleta.substring(0, 300);
        }

        Producto producto = Producto.builder()
                .fecha(LocalDate.now())
                .disponible("si")
                .descripcionCatalogo(descCatalogo)
                .descripcionCompleta(descCompleta)
                .revisor(1)
                .duenio(solicitud.getClienteId())
                .build();
        productoRepository.save(producto);
    }

    @Transactional
    public Subasta crearSubasta(CrearSubastaRequest request) {
        Subastador subastador = subastadorRepository.findById(SUBASTADOR_SISTEMA_ID)
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
        Integer duenioId = request.getDuenio();
        if (!duenioRepository.existsById(duenioId)) {
            Duenio nuevoDuenio = Duenio.builder()
                    .identificador(duenioId)
                    .verificador(1)
                    .verificacionFinanciera("no")
                    .verificacionJudicial("no")
                    .calificacionRiesgo(3)
                    .build();
            duenioRepository.save(nuevoDuenio);
        }

        Producto producto = Producto.builder()
                .fecha(LocalDate.now())
                .disponible("si")
                .descripcionCatalogo(request.getDescripcionCatalogo())
                .descripcionCompleta(request.getDescripcionCompleta())
                .revisor(1)
                .duenio(duenioId)
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

    public List<MedioPagoResponse> listarMediosPagoPendientes() {
        return medioPagoRepository.findAllByVerificado("no")
                .stream()
                .map(this::toMedioPagoResponse)
                .toList();
    }

    @Transactional
    public void aprobarMedioPago(Integer id) {
        MedioPago medio = medioPagoRepository.findById(id)
                .orElseThrow(() -> new CustomException("Medio de pago no encontrado", HttpStatus.NOT_FOUND));

        if ("si".equals(medio.getVerificado())) {
            throw new CustomException("El medio de pago ya está verificado", HttpStatus.BAD_REQUEST);
        }

        medio.setVerificado("si");
        medioPagoRepository.save(medio);
    }

    public List<PreRegistracionResponse> listarSolicitudesUsuarios() {
        return preRegistracionRepository.findAllByEstado("pendiente")
                .stream()
                .map(this::toUsuarioResponse)
                .toList();
    }

    private MedioPagoResponse toMedioPagoResponse(MedioPago m) {
        return MedioPagoResponse.builder()
                .id(m.getIdentificador())
                .tipo(m.getTipo())
                .entidad(m.getEntidad())
                .numero(m.getNumero())
                .montoGarantizado(m.getMontoGarantizado())
                .verificado(m.getVerificado())
                .build();
    }

    private PreRegistracionResponse toUsuarioResponse(PreRegistracion p) {
        return PreRegistracionResponse.builder()
                .id(p.getIdentificador())
                .nombre(p.getNombre())
                .apellido(p.getApellido())
                .email(p.getEmail())
                .estado(p.getEstado())
                .fechaSolicitud(p.getFechaSolicitud())
                .build();
    }

    private SolicitudItemResponse toResponse(SolicitudItem s) {
        List<Integer> fotoIds = solicitudFotoRepository.findIdsBySolicitudItemId(s.getIdentificador());
        return SolicitudItemResponse.builder()
                .id(s.getIdentificador())
                .descripcion(s.getDescripcion())
                .descripcionCompleta(s.getDescripcionCompleta())
                .precioSugerido(s.getPrecioSugerido())
                .estado(s.getEstado())
                .fechaSolicitud(s.getFechaSolicitud())
                .fotoIds(fotoIds)
                .build();
    }
}
