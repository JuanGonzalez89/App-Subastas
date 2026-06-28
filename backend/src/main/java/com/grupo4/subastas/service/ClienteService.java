package com.grupo4.subastas.service;

import com.grupo4.subastas.dto.request.MedioPagoRequest;
import com.grupo4.subastas.dto.response.*;
import com.grupo4.subastas.exception.CustomException;
import com.grupo4.subastas.model.entity.*;
import com.grupo4.subastas.repository.*;
import com.grupo4.subastas.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository      clienteRepository;
    private final UsuarioRepository      usuarioRepository;
    private final MedioPagoRepository    medioPagoRepository;
    private final AsistenteRepository    asistenteRepository;
    private final PujoRepository         pujoRepository;
    private final SolicitudItemRepository solicitudItemRepository;
    private final SolicitudFotoRepository solicitudFotoRepository;
    private final SolicitudItemService   solicitudItemService;

    // ── Perfil ───────────────────────────────────────────────────────────────

    @Transactional
    public PerfilResponse obtenerPerfil(String email) {
        Cliente cliente = findByEmail(email);
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Usuario no encontrado", HttpStatus.NOT_FOUND));
        return PerfilResponse.builder()
                .id(cliente.getIdentificador())
                .nombre(cliente.getPersona().getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .documento(cliente.getPersona().getDocumento())
                .direccion(cliente.getPersona().getDireccion())
                .numeroPais(cliente.getNumeroPais())
                .categoria(cliente.getCategoria())
                .admitido(cliente.getAdmitido())
                .build();
    }

    // ── Medios de pago ───────────────────────────────────────────────────────

    @Transactional
    public List<MedioPagoResponse> listarMediosPago(String email) {
        Cliente cliente = findByEmail(email);
        return medioPagoRepository.findByClienteId(cliente.getIdentificador())
                .stream()
                .map(this::toMedioPagoResponse)
                .toList();
    }

    @Transactional
    public MedioPagoResponse agregarMedioPago(String email, MedioPagoRequest request) {
        Cliente cliente = findByEmail(email);
        // El medio de pago se registra sin verificar. La empresa lo verifica ANTES
        // del inicio de la subasta (manual). Sin un medio verificado solo se puede
        // mirar la subasta, no pujar.
        MedioPago medio = MedioPago.builder()
                .clienteId(cliente.getIdentificador())
                .tipo(request.getTipo())
                .entidad(request.getEntidad())
                .numero(request.getNumero())
                .montoGarantizado(request.getMontoGarantizado())
                .verificado("no")
                .build();
        return toMedioPagoResponse(medioPagoRepository.save(medio));
    }

    @Transactional
    public void eliminarMedioPago(String email, Integer medioPagoId) {
        Cliente cliente = findByEmail(email);
        MedioPago medio = medioPagoRepository.findById(medioPagoId)
                .orElseThrow(() -> new CustomException("Medio de pago no encontrado", HttpStatus.NOT_FOUND));
        if (!medio.getClienteId().equals(cliente.getIdentificador())) {
            throw new CustomException("No autorizado", HttpStatus.FORBIDDEN);
        }
        medioPagoRepository.delete(medio);
    }

    // ── Historial ────────────────────────────────────────────────────────────

    @Transactional
    public HistorialResponse obtenerHistorial(String email) {
        Cliente cliente = findByEmail(email);
        Integer clienteId = cliente.getIdentificador();

        // 1. Todos los asistentes del cliente
        List<Asistente> asistentes = asistenteRepository.findByClienteId(clienteId);

        if (asistentes.isEmpty()) {
            return HistorialResponse.builder()
                    .subastasAsistidas(0)
                    .subastasGanadas(0)
                    .importeTotalOfertado(BigDecimal.ZERO)
                    .pujas(List.of())
                    .build();
        }

        // 2. Mapa: asistenteId → subastaId
        Map<Integer, Integer> asistenteSubastaMap = asistentes.stream()
                .collect(Collectors.toMap(Asistente::getIdentificador, Asistente::getSubastaId));

        List<Integer> asistenteIds = asistentes.stream()
                .map(Asistente::getIdentificador)
                .toList();

        // 3. Todas las pujas de esos asistentes
        List<Pujo> pujos = pujoRepository.findByAsistenteIdIn(asistenteIds);

        // 4. Métricas
        int subastasAsistidas = asistentes.size();
        long subastasGanadas  = pujos.stream()
                .filter(p -> "si".equals(p.getGanador()))
                .map(p -> asistenteSubastaMap.get(p.getAsistenteId()))
                .distinct()
                .count();
        BigDecimal importeTotal = pujoRepository.sumImporteByAsistenteIds(asistenteIds);

        // 5. Lista de pujas con subastaId resuelto
        List<HistorialResponse.PujaHistorialItem> listaPujas = pujos.stream()
                .map(p -> HistorialResponse.PujaHistorialItem.builder()
                        .pujaId(p.getIdentificador())
                        .subastaId(asistenteSubastaMap.getOrDefault(p.getAsistenteId(), 0))
                        .itemId(p.getItemId())
                        .monto(p.getImporte())
                        .ganador(p.getGanador())
                        .build())
                .toList();

        return HistorialResponse.builder()
                .subastasAsistidas(subastasAsistidas)
                .subastasGanadas(subastasGanadas)
                .importeTotalOfertado(importeTotal)
                .pujas(listaPujas)
                .build();
    }

    // ── Solicitar ítem ───────────────────────────────────────────────────────

    @Transactional
    public SolicitudItemResponse solicitarItem(String email, String descripcion, String descripcionCompleta, BigDecimal precioSugerido, MultipartFile[] fotos) {
        Cliente cliente = findByEmail(email);

        // La solicitud queda en estado 'pendiente'. La empresa revisa los datos y
        // las fotos, manifiesta interés, inspecciona y propone condiciones (flujo
        // manual). El estado por defecto lo asigna la entidad (@PrePersist).
        SolicitudItem solicitud = SolicitudItem.builder()
                .clienteId(cliente.getIdentificador())
                .descripcion(descripcion)
                .descripcionCompleta(descripcionCompleta)
                .precioSugerido(precioSugerido)
                .build();

        solicitud = solicitudItemRepository.save(solicitud);

        if (fotos != null) {
            for (int i = 0; i < fotos.length; i++) {
                try {
                    SolicitudFoto foto = SolicitudFoto.builder()
                            .solicitudItemId(solicitud.getIdentificador())
                            .foto(fotos[i].getBytes())
                            .orden(i)
                            .build();
                    solicitudFotoRepository.save(foto);
                } catch (IOException e) {
                    throw new CustomException("Error al procesar la foto " + i, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }

        return solicitudItemService.toResponse(solicitud);
    }

    @Transactional
    public List<SolicitudItemResponse> listarMisSolicitudes(String email) {
        Cliente cliente = findByEmail(email);
        return solicitudItemRepository
                .findByClienteIdOrderByFechaSolicitudDesc(cliente.getIdentificador())
                .stream()
                .map(solicitudItemService::toResponse)
                .toList();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Cliente findByEmail(String email) {
        return clienteRepository.findByPersonaEmail(email)
                .orElseThrow(() -> new CustomException("Cliente no encontrado", HttpStatus.NOT_FOUND));
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

}
