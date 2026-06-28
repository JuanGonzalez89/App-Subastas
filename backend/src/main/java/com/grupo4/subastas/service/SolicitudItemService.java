package com.grupo4.subastas.service;

import com.grupo4.subastas.dto.request.ProponerCondicionesRequest;
import com.grupo4.subastas.dto.response.SolicitudItemResponse;
import com.grupo4.subastas.exception.CustomException;
import com.grupo4.subastas.model.entity.*;
import com.grupo4.subastas.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudItemService {

    private final SolicitudItemRepository solicitudItemRepository;
    private final SolicitudFotoRepository  solicitudFotoRepository;
    private final ClienteRepository        clienteRepository;
    private final DuenioRepository         duenioRepository;
    private final ProductoRepository       productoRepository;
    private final SubastaRepository        subastaRepository;
    private final CatalogoRepository       catalogoRepository;
    private final ItemCatalogoRepository   itemCatalogoRepository;
    private final FotoRepository           fotoRepository;

    private static final Integer SISTEMA_EMPLEADO_ID = 1;

    // ── Listar todas (para la empresa) ───────────────────────────────────────

    public List<SolicitudItemResponse> listarTodas() {
        return solicitudItemRepository.findAllByOrderByFechaSolicitudDesc()
                .stream().map(this::toResponse).toList();
    }

    // ── Etapa 2: empresa muestra interés ─────────────────────────────────────

    @Transactional
    public SolicitudItemResponse mostrarInteres(Integer id, String direccionEnvio) {
        SolicitudItem s = findById(id);
        validarEstado(s, "pendiente");
        s.setEstado("interesado");
        s.setDireccionEnvio(direccionEnvio);
        return toResponse(solicitudItemRepository.save(s));
    }

    // ── Etapa 3a: artículo recibido para inspección ───────────────────────────

    @Transactional
    public SolicitudItemResponse marcarEnInspeccion(Integer id) {
        SolicitudItem s = findById(id);
        validarEstado(s, "interesado");
        s.setEstado("en_inspeccion");
        return toResponse(solicitudItemRepository.save(s));
    }

    // ── Etapa 3b: empresa rechaza tras inspección ─────────────────────────────

    @Transactional
    public SolicitudItemResponse rechazarItem(Integer id, String motivo) {
        SolicitudItem s = findById(id);
        if (!"pendiente".equals(s.getEstado()) && !"en_inspeccion".equals(s.getEstado())) {
            throw new CustomException("Solo se puede rechazar en estado pendiente o en_inspeccion", HttpStatus.BAD_REQUEST);
        }
        s.setEstado("rechazado");
        s.setMotivoRechazo(motivo);
        return toResponse(solicitudItemRepository.save(s));
    }

    // ── Etapa 4: empresa propone condiciones ──────────────────────────────────

    @Transactional
    public SolicitudItemResponse proponerCondiciones(Integer id, ProponerCondicionesRequest req) {
        SolicitudItem s = findById(id);
        validarEstado(s, "en_inspeccion");
        s.setEstado("condiciones_propuestas");
        s.setValorBase(req.getValorBase());
        s.setComision(req.getComision());
        s.setFechaSubasta(req.getFechaSubasta());
        s.setHoraSubasta(req.getHoraSubasta());
        s.setLugarSubasta(req.getLugarSubasta());
        return toResponse(solicitudItemRepository.save(s));
    }

    // ── Etapa 5a: dueño acepta condiciones ───────────────────────────────────

    @Transactional
    public SolicitudItemResponse aceptarCondiciones(Integer id, String email) {
        SolicitudItem s = findAndVerifyOwner(id, email);
        validarEstado(s, "condiciones_propuestas");
        s.setEstado("aceptado");
        s.setDepositoUbicacion("Depósito Central - Dock Sud, Avellaneda");
        s.setPolizaSeguro("Póliza N° " + String.format("%06d", s.getIdentificador()) + " - Aseguradora del Sur SA");
        solicitudItemRepository.save(s);

        // Crear Duenio si no existe y crear Producto en el sistema
        Integer clienteId = s.getClienteId();
        if (!duenioRepository.existsById(clienteId)) {
            duenioRepository.save(Duenio.builder()
                    .identificador(clienteId)
                    .verificador(SISTEMA_EMPLEADO_ID)
                    .verificacionFinanciera("no")
                    .verificacionJudicial("no")
                    .calificacionRiesgo(3)
                    .build());
        }

        String descCat = s.getDescripcion();
        if (descCat != null && descCat.length() > 300) descCat = descCat.substring(0, 300);
        String descComp = s.getDescripcionCompleta();
        if (descComp != null && descComp.length() > 300) descComp = descComp.substring(0, 300);

        Producto producto = productoRepository.save(Producto.builder()
                .fecha(LocalDate.now())
                .disponible("si")
                .descripcionCatalogo(descCat)
                .descripcionCompleta(descComp)
                .revisor(SISTEMA_EMPLEADO_ID)
                .duenio(clienteId)
                .build());

        // Copiar las fotos de la solicitud al producto publicado
        for (SolicitudFoto sf : solicitudFotoRepository.findBySolicitudItemIdOrderByOrdenAsc(s.getIdentificador())) {
            fotoRepository.save(Foto.builder().producto(producto).foto(sf.getFoto()).build());
        }

        // Asignar al catálogo de la subasta correspondiente a la categoría del cliente
        Cliente cliente = clienteRepository.findById(clienteId).orElse(null);
        if (cliente != null) {
            String categoria = cliente.getCategoria() != null ? cliente.getCategoria() : "comun";
            List<Subasta> subastas = subastaRepository.findAbiertosByCategoria(categoria);
            if (!subastas.isEmpty()) {
                Subasta subasta = subastas.get(0);
                Catalogo catalogo = catalogoRepository.findBySubastaId(subasta.getIdentificador())
                        .orElseGet(() -> catalogoRepository.save(Catalogo.builder()
                                .descripcion("Catalogo " + subasta.getCategoria())
                                .subasta(subasta)
                                .responsable(SISTEMA_EMPLEADO_ID)
                                .build()));
                BigDecimal comision = s.getComision() != null ? s.getComision() : BigDecimal.valueOf(15);
                BigDecimal valorBase = s.getValorBase() != null ? s.getValorBase() : BigDecimal.valueOf(10000);
                itemCatalogoRepository.save(ItemCatalogo.builder()
                        .catalogo(catalogo)
                        .producto(producto)
                        .precioBase(valorBase)
                        .comision(comision)
                        .subastado("no")
                        .build());
            }
        }

        return toResponse(s);
    }

    // ── Etapa 5b: dueño rechaza condiciones ──────────────────────────────────

    @Transactional
    public SolicitudItemResponse rechazarCondiciones(Integer id, String email) {
        SolicitudItem s = findAndVerifyOwner(id, email);
        validarEstado(s, "condiciones_propuestas");
        s.setEstado("rechazado_duenio");
        return toResponse(solicitudItemRepository.save(s));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private SolicitudItem findById(Integer id) {
        return solicitudItemRepository.findById(id)
                .orElseThrow(() -> new CustomException("Solicitud no encontrada", HttpStatus.NOT_FOUND));
    }

    private SolicitudItem findAndVerifyOwner(Integer id, String email) {
        SolicitudItem s = findById(id);
        Cliente cliente = clienteRepository.findByPersonaEmail(email)
                .orElseThrow(() -> new CustomException("Cliente no encontrado", HttpStatus.NOT_FOUND));
        if (!s.getClienteId().equals(cliente.getIdentificador())) {
            throw new CustomException("No tenés permiso para modificar esta solicitud", HttpStatus.FORBIDDEN);
        }
        return s;
    }

    private void validarEstado(SolicitudItem s, String estadoEsperado) {
        if (!estadoEsperado.equals(s.getEstado())) {
            throw new CustomException(
                    "La solicitud debe estar en estado '" + estadoEsperado + "' (estado actual: " + s.getEstado() + ")",
                    HttpStatus.BAD_REQUEST);
        }
    }

    public SolicitudItemResponse toResponse(SolicitudItem s) {
        List<Integer> fotoIds = solicitudFotoRepository.findIdsBySolicitudItemId(s.getIdentificador());
        return SolicitudItemResponse.builder()
                .id(s.getIdentificador())
                .descripcion(s.getDescripcion())
                .descripcionCompleta(s.getDescripcionCompleta())
                .precioSugerido(s.getPrecioSugerido())
                .estado(s.getEstado())
                .fechaSolicitud(s.getFechaSolicitud())
                .fotoIds(fotoIds)
                .direccionEnvio(s.getDireccionEnvio())
                .motivoRechazo(s.getMotivoRechazo())
                .valorBase(s.getValorBase())
                .comision(s.getComision())
                .fechaSubasta(s.getFechaSubasta())
                .horaSubasta(s.getHoraSubasta())
                .lugarSubasta(s.getLugarSubasta())
                .depositoUbicacion(s.getDepositoUbicacion())
                .polizaSeguro(s.getPolizaSeguro())
                .build();
    }
}
