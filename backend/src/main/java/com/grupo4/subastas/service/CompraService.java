package com.grupo4.subastas.service;

import com.grupo4.subastas.dto.request.PagarCompraRequest;
import com.grupo4.subastas.dto.response.CompraResponse;
import com.grupo4.subastas.dto.response.MultaResponse;
import com.grupo4.subastas.dto.response.PagoResultResponse;
import com.grupo4.subastas.exception.CustomException;
import com.grupo4.subastas.model.entity.*;
import com.grupo4.subastas.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Gestiona las compras (bienes ganados) y su pago. Implementa las reglas del
 * documento sobre el pago de lo adquirido, el límite del cheque/garantía, la
 * multa del 10% y el plazo de 72 hs.
 */
@Service
@RequiredArgsConstructor
public class CompraService {

    private final ClienteRepository           clienteRepository;
    private final RegistroDeSubastaRepository registroRepository;
    private final ProductoRepository          productoRepository;
    private final FotoRepository              fotoRepository;
    private final MedioPagoRepository         medioPagoRepository;
    private final MultaRepository             multaRepository;
    private final SubastaRepository           subastaRepository;

    private static final BigDecimal PORCENTAJE_MULTA = new BigDecimal("0.10"); // 10% del valor ofertado
    private static final int        HORAS_PLAZO_PAGO = 72;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // ── Listar mis compras (bienes ganados) ──────────────────────────────────

    @Transactional
    public List<CompraResponse> listarCompras(String email) {
        Cliente cliente = findCliente(email);
        expirarMultasVencidas(cliente.getIdentificador());
        return registroRepository.findByClienteIdOrderByIdentificadorDesc(cliente.getIdentificador())
                .stream()
                .map(this::toCompraResponse)
                .toList();
    }

    // ── Pagar un bien ganado ─────────────────────────────────────────────────

    @Transactional
    public PagoResultResponse pagar(String email, Integer registroId, PagarCompraRequest req) {
        Cliente cliente = findCliente(email);
        expirarMultasVencidas(cliente.getIdentificador());

        RegistroDeSubasta registro = registroRepository.findById(registroId)
                .orElseThrow(() -> new CustomException("Compra no encontrada", HttpStatus.NOT_FOUND));
        if (!registro.getClienteId().equals(cliente.getIdentificador())) {
            throw new CustomException("Esta compra no te pertenece", HttpStatus.FORBIDDEN);
        }
        if ("pagado".equals(registro.getEstadoPago())) {
            throw new CustomException("Esta compra ya fue pagada", HttpStatus.BAD_REQUEST);
        }

        MedioPago medio = medioPagoRepository.findById(req.getMedioPagoId())
                .orElseThrow(() -> new CustomException("Medio de pago no encontrado", HttpStatus.NOT_FOUND));
        if (!medio.getClienteId().equals(cliente.getIdentificador())) {
            throw new CustomException("El medio de pago no te pertenece", HttpStatus.FORBIDDEN);
        }
        if (!"si".equals(medio.getVerificado())) {
            throw new CustomException("El medio de pago no está verificado por la empresa", HttpStatus.BAD_REQUEST);
        }

        BigDecimal total = totalCompra(registro);

        // ¿El medio cubre el total? (un cheque/garantía con monto menor NO cubre)
        BigDecimal montoGarantizado = medio.getMontoGarantizado();
        boolean fondosInsuficientes = montoGarantizado != null && montoGarantizado.compareTo(total) < 0;

        List<Multa> multasDeLaCompra = multaRepository.findByRegistroIdAndEstado(registro.getIdentificador(), "pendiente");

        if (fondosInsuficientes) {
            // Ajuste 1: si esta compra ya tiene una multa pendiente, NO se permite
            // reintentar con otro medio que tampoco cubre (no se genera otra multa).
            if (!multasDeLaCompra.isEmpty() || "multa".equals(registro.getEstadoPago())) {
                throw new CustomException(String.format(
                        "Ya tenés una multa pendiente por esta compra. Para cancelarla, pagá con un medio de pago que cubra el total (%.2f).",
                        total), HttpStatus.BAD_REQUEST);
            }

            BigDecimal importeMulta = registro.getImporte()
                    .multiply(PORCENTAJE_MULTA)
                    .setScale(2, RoundingMode.HALF_UP);
            LocalDateTime fechaLimite = LocalDateTime.now().plusHours(HORAS_PLAZO_PAGO);

            Multa multa = Multa.builder()
                    .clienteId(cliente.getIdentificador())
                    .importe(importeMulta)
                    .motivo("Fondos insuficientes al pagar el bien ganado (registro " + registro.getIdentificador() + ")")
                    .estado("pendiente")
                    .fechaLimite(fechaLimite)
                    .registroId(registro.getIdentificador())
                    .build();
            multaRepository.save(multa);

            registro.setMedioPagoId(medio.getIdentificador());
            registro.setEstadoPago("multa");
            registroRepository.save(registro);

            String fechaLimiteStr = fechaLimite.format(FMT);
            return PagoResultResponse.builder()
                    .pagado(false)
                    .multaGenerada(true)
                    .multaImporte(importeMulta)
                    .fechaLimite(fechaLimiteStr)
                    .mensaje(String.format(
                            "Tu %s no cubre el total a pagar (%.2f). Se generó una multa del 10%% (%.2f). " +
                            "Tenés 72 hs (hasta el %s) para pagar con otro medio. " +
                            "No vas a poder participar de otra subasta hasta cancelar la multa.",
                            etiquetaMedio(medio.getTipo()), total, importeMulta, fechaLimiteStr))
                    .compra(toCompraResponse(registro))
                    .build();
        }

        // Pago exitoso. Ajuste 2: si la compra tenía multas pendientes, se cancelan.
        boolean habiaMulta = !multasDeLaCompra.isEmpty();
        multaRepository.deleteAll(multasDeLaCompra);

        registro.setMedioPagoId(medio.getIdentificador());
        registro.setEstadoPago("pagado");
        registro.setFechaPago(LocalDateTime.now());
        registroRepository.save(registro);

        String mensaje = habiaMulta
                ? String.format("Pago realizado con éxito por %.2f. Se canceló la multa por fondos insuficientes de esta compra.", total)
                : String.format("Pago realizado con éxito por %.2f.", total);

        return PagoResultResponse.builder()
                .pagado(true)
                .multaGenerada(false)
                .mensaje(mensaje)
                .compra(toCompraResponse(registro))
                .build();
    }

    /**
     * Borra las multas vencidas (pasaron las 72 hs) y devuelve la compra asociada
     * al estado 'pendiente' para que pueda volver a intentarse el pago.
     */
    private void expirarMultasVencidas(Integer clienteId) {
        LocalDateTime ahora = LocalDateTime.now();
        for (Multa m : multaRepository.findByClienteIdAndEstado(clienteId, "pendiente")) {
            if (m.getFechaLimite() != null && m.getFechaLimite().isBefore(ahora)) {
                if (m.getRegistroId() != null) {
                    registroRepository.findById(m.getRegistroId()).ifPresent(r -> {
                        if ("multa".equals(r.getEstadoPago())) {
                            r.setEstadoPago("pendiente");
                            registroRepository.save(r);
                        }
                    });
                }
                multaRepository.delete(m);
            }
        }
    }

    // ── Multas ────────────────────────────────────────────────────────────────

    @Transactional
    public List<MultaResponse> listarMultas(String email) {
        Cliente cliente = findCliente(email);
        expirarMultasVencidas(cliente.getIdentificador());
        return multaRepository.findByClienteIdOrderByFechaCreacionDesc(cliente.getIdentificador())
                .stream()
                .map(this::toMultaResponse)
                .toList();
    }

    @Transactional
    public MultaResponse pagarMulta(String email, Integer multaId) {
        Cliente cliente = findCliente(email);
        Multa multa = multaRepository.findById(multaId)
                .orElseThrow(() -> new CustomException("Multa no encontrada", HttpStatus.NOT_FOUND));
        if (!multa.getClienteId().equals(cliente.getIdentificador())) {
            throw new CustomException("Esta multa no te pertenece", HttpStatus.FORBIDDEN);
        }
        if ("pagada".equals(multa.getEstado())) {
            throw new CustomException("Esta multa ya fue pagada", HttpStatus.BAD_REQUEST);
        }
        multa.setEstado("pagada");
        multaRepository.save(multa);
        return toMultaResponse(multa);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Cliente findCliente(String email) {
        return clienteRepository.findByPersonaEmail(email)
                .orElseThrow(() -> new CustomException("Cliente no encontrado", HttpStatus.NOT_FOUND));
    }

    private BigDecimal totalCompra(RegistroDeSubasta r) {
        BigDecimal importe = r.getImporte() != null ? r.getImporte() : BigDecimal.ZERO;
        BigDecimal comision = r.getComision() != null ? r.getComision() : BigDecimal.ZERO;
        BigDecimal envio = r.getCostoEnvio() != null ? r.getCostoEnvio() : BigDecimal.ZERO;
        return importe.add(comision).add(envio);
    }

    private String etiquetaMedio(String tipo) {
        if (tipo == null) return "medio de pago";
        return switch (tipo) {
            case "cheque_certificado" -> "cheque certificado";
            case "tarjeta_credito"    -> "tarjeta de crédito";
            case "cuenta_bancaria"    -> "cuenta bancaria";
            default -> "medio de pago";
        };
    }

    private CompraResponse toCompraResponse(RegistroDeSubasta r) {
        Producto producto = productoRepository.findById(r.getProductoId()).orElse(null);
        List<Integer> fotoIds = fotoRepository.findIdsByProductoId(r.getProductoId());
        String moneda = subastaRepository.findById(r.getSubastaId())
                .map(s -> s.getExt() != null && s.getExt().getMoneda() != null ? s.getExt().getMoneda() : "ARS")
                .orElse("ARS");

        return CompraResponse.builder()
                .registroId(r.getIdentificador())
                .productoId(r.getProductoId())
                .descripcion(producto != null ? producto.getDescripcionCatalogo() : "Bien adquirido")
                .fotoIds(fotoIds)
                .importe(r.getImporte())
                .comision(r.getComision())
                .costoEnvio(r.getCostoEnvio())
                .total(totalCompra(r))
                .moneda(moneda)
                .estadoPago(r.getEstadoPago())
                .fechaPago(r.getFechaPago() != null ? r.getFechaPago().format(FMT) : null)
                .build();
    }

    private MultaResponse toMultaResponse(Multa m) {
        return MultaResponse.builder()
                .id(m.getIdentificador())
                .importe(m.getImporte())
                .motivo(m.getMotivo())
                .estado(m.getEstado())
                .fechaLimite(m.getFechaLimite() != null ? m.getFechaLimite().format(FMT) : null)
                .fechaCreacion(m.getFechaCreacion() != null ? m.getFechaCreacion().format(FMT) : null)
                .build();
    }
}
