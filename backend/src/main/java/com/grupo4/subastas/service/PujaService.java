package com.grupo4.subastas.service;

import com.grupo4.subastas.dto.request.PujaRequest;
import com.grupo4.subastas.dto.response.ConectarResponse;
import com.grupo4.subastas.dto.response.PujaResponse;
import com.grupo4.subastas.exception.CustomException;
import com.grupo4.subastas.model.entity.Asistente;
import com.grupo4.subastas.model.entity.Catalogo;
import com.grupo4.subastas.model.entity.ItemCatalogo;
import com.grupo4.subastas.model.entity.Pujo;
import com.grupo4.subastas.model.entity.Subasta;
import com.grupo4.subastas.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PujaService {

    private final ClienteRepository      clienteRepository;
    private final AsistenteRepository    asistenteRepository;
    private final SubastaRepository      subastaRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujoRepository         pujoRepository;
    private final MedioPagoRepository    medioPagoRepository;
    private final CatalogoRepository     catalogoRepository;

    // Categorías que están exentas de los límites de puja
    private static final Set<String> CATEGORIAS_SIN_LIMITE = Set.of("oro", "platino");

    // ─── Conectarse a una subasta ─────────────────────────────────────────────

    @Transactional
    public ConectarResponse conectar(Integer subastaId, String email) {

        var cliente = clienteRepository.findByPersonaEmail(email)
                .orElseThrow(() -> new CustomException("Cliente no encontrado", HttpStatus.NOT_FOUND));

        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new CustomException("Subasta no encontrada", HttpStatus.NOT_FOUND));

        // Verificar que la subasta está abierta
        if (!"abierta".equals(subasta.getEstado())) {
            throw new CustomException("La subasta no está abierta", HttpStatus.BAD_REQUEST);
        }

        // Si ya está conectado a esta subasta, devolver su asistente existente (idempotente)
        Optional<Asistente> existente = asistenteRepository
                .findByClienteIdAndSubastaId(cliente.getIdentificador(), subastaId);

        if (existente.isPresent()) {
            Asistente a = existente.get();
            return ConectarResponse.builder()
                    .asistenteId(a.getIdentificador())
                    .numeroPostor(a.getNumeroPostor())
                    .build();
        }

        // Regla de negocio: el usuario no puede estar conectado en otra subasta abierta simultáneamente
        if (asistenteRepository.existeClienteEnOtraSubastaAbierta(cliente.getIdentificador(), subastaId)) {
            throw new CustomException(
                    "Ya estás conectado a otra subasta en curso. Salí de ella antes de unirte a esta.",
                    HttpStatus.CONFLICT);
        }

        // Asignar próximo número de postor
        int proximoPostor = asistenteRepository.countBySubastaId(subastaId) + 1;

        Asistente nuevo = Asistente.builder()
                .clienteId(cliente.getIdentificador())
                .subastaId(subastaId)
                .numeroPostor(proximoPostor)
                .build();

        nuevo = asistenteRepository.save(nuevo);

        return ConectarResponse.builder()
                .asistenteId(nuevo.getIdentificador())
                .numeroPostor(nuevo.getNumeroPostor())
                .build();
    }

    // ─── Registrar una puja ───────────────────────────────────────────────────

    @Transactional
    public PujaResponse pujar(Integer subastaId, String email, PujaRequest request) {

        var cliente = clienteRepository.findByPersonaEmail(email)
                .orElseThrow(() -> new CustomException("Cliente no encontrado", HttpStatus.NOT_FOUND));

        // Verificar que el cliente está conectado a la subasta
        Asistente asistente = asistenteRepository
                .findByClienteIdAndSubastaId(cliente.getIdentificador(), subastaId)
                .orElseThrow(() -> new CustomException(
                        "Primero debés inscribirte a esta subasta", HttpStatus.FORBIDDEN));

        // Verificar que el cliente tiene AL MENOS UN medio de pago verificado
        boolean tieneMedioPagoVerificado = medioPagoRepository
                .existsByClienteIdAndVerificado(cliente.getIdentificador(), "si");
        if (!tieneMedioPagoVerificado) {
            throw new CustomException(
                    "Necesitás al menos un medio de pago verificado para pujar. " +
                    "Registrá y aguardá la verificación de tu medio de pago.",
                    HttpStatus.FORBIDDEN);
        }

        // Obtener el ítem
        ItemCatalogo item = itemCatalogoRepository.findById(request.getItemId())
                .orElseThrow(() -> new CustomException("Ítem no encontrado", HttpStatus.NOT_FOUND));

        if (item.getSubastado() != null && item.getSubastado().equals("si")) {
            throw new CustomException("Este ítem ya fue subastado", HttpStatus.BAD_REQUEST);
        }

        // Validar que el ítem pertenece al catálogo de esta subasta
        Catalogo catalogo = catalogoRepository.findBySubastaId(subastaId)
                .orElseThrow(() -> new CustomException("La subasta no tiene un catálogo", HttpStatus.NOT_FOUND));
        if (!item.getCatalogo().getIdentificador().equals(catalogo.getIdentificador())) {
            throw new CustomException("El ítem no pertenece a esta subasta", HttpStatus.BAD_REQUEST);
        }

        // Obtener la categoría de la subasta para aplicar (o no) los límites
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new CustomException("Subasta no encontrada", HttpStatus.NOT_FOUND));

        BigDecimal precioBase   = item.getPrecioBase();
        if (precioBase == null) {
            throw new CustomException("El ítem no tiene precio base configurado", HttpStatus.BAD_REQUEST);
        }
        BigDecimal ofertaActual = pujoRepository.findMaxImporteByItemId(request.getItemId())
                .orElse(precioBase);

        // Validar rango SOLO si la categoría NO es oro ni platino
        boolean aplicaLimites = !CATEGORIAS_SIN_LIMITE.contains(subasta.getCategoria());

        if (aplicaLimites) {
            BigDecimal incrementoMin = precioBase.multiply(new BigDecimal("0.01"));
            BigDecimal incrementoMax = precioBase.multiply(new BigDecimal("0.20"));
            BigDecimal pujaMin       = ofertaActual.add(incrementoMin);
            BigDecimal pujaMax       = ofertaActual.add(incrementoMax);

            if (request.getMonto().compareTo(pujaMin) < 0) {
                throw new CustomException(
                        String.format("La oferta mínima es %.2f (oferta actual + 1%% del precio base)", pujaMin),
                        HttpStatus.BAD_REQUEST);
            }
            if (request.getMonto().compareTo(pujaMax) > 0) {
                throw new CustomException(
                        String.format("La oferta máxima es %.2f (oferta actual + 20%% del precio base)", pujaMax),
                        HttpStatus.BAD_REQUEST);
            }
        } else {
            // Para oro/platino: al menos debe superar la oferta actual
            if (request.getMonto().compareTo(ofertaActual) <= 0) {
                throw new CustomException(
                        String.format("Tu oferta debe superar la oferta actual de %.2f", ofertaActual),
                        HttpStatus.BAD_REQUEST);
            }
        }

        // Guardar la puja
        Pujo pujo = Pujo.builder()
                .asistenteId(asistente.getIdentificador())
                .itemId(request.getItemId())
                .importe(request.getMonto())
                .ganador("no")
                .build();

        pujo = pujoRepository.save(pujo);

        return PujaResponse.builder()
                .id(pujo.getIdentificador())
                .asistenteId(asistente.getIdentificador())
                .numeroPostor(asistente.getNumeroPostor())
                .monto(pujo.getImporte())
                .ganador(pujo.getGanador())
                .esPropio(true)
                .build();
    }

    // ─── Listar pujas de un item ──────────────────────────────────────────────

    @Transactional
    public List<PujaResponse> listarPujas(Integer subastaId, Integer itemId, String email) {

        Integer miAsistenteId = clienteRepository.findByPersonaEmail(email)
                .flatMap(c -> asistenteRepository.findByClienteIdAndSubastaId(c.getIdentificador(), subastaId))
                .map(Asistente::getIdentificador)
                .orElse(null);

        return pujoRepository.findByItemIdOrderByImporteDesc(itemId)
                .stream()
                .map(p -> {
                    Integer nPostor = asistenteRepository.findById(p.getAsistenteId())
                            .map(Asistente::getNumeroPostor)
                            .orElse(0);

                    return PujaResponse.builder()
                            .id(p.getIdentificador())
                            .asistenteId(p.getAsistenteId())
                            .numeroPostor(nPostor)
                            .monto(p.getImporte())
                            .ganador(p.getGanador())
                            .esPropio(p.getAsistenteId().equals(miAsistenteId))
                            .build();
                })
                .toList();
    }
}
