package com.grupo4.subastas.controller;

import com.grupo4.subastas.dto.request.MedioPagoRequest;
import com.grupo4.subastas.dto.response.*;
import com.grupo4.subastas.service.ClienteService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    // ── Perfil ───────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<PerfilResponse> perfil(Authentication auth) {
        return ResponseEntity.ok(clienteService.obtenerPerfil(auth.getName()));
    }

    // ── Medios de pago ───────────────────────────────────────────────────────

    @GetMapping("/me/medios-pago")
    public ResponseEntity<List<MedioPagoResponse>> listarMediosPago(Authentication auth) {
        return ResponseEntity.ok(clienteService.listarMediosPago(auth.getName()));
    }

    @PostMapping("/me/medios-pago")
    public ResponseEntity<MedioPagoResponse> agregarMedioPago(
            Authentication auth,
            @Valid @RequestBody MedioPagoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteService.agregarMedioPago(auth.getName(), request));
    }

    @DeleteMapping("/me/medios-pago/{id}")
    public ResponseEntity<Void> eliminarMedioPago(
            Authentication auth,
            @PathVariable Integer id) {
        clienteService.eliminarMedioPago(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Historial ────────────────────────────────────────────────────────────

    @GetMapping("/me/historial")
    public ResponseEntity<HistorialResponse> historial(Authentication auth) {
        return ResponseEntity.ok(clienteService.obtenerHistorial(auth.getName()));
    }

    // ── Solicitar ítem ───────────────────────────────────────────────────────

    @PostMapping(value = "/me/solicitudes-items", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SolicitudItemResponse> solicitarItem(
            Authentication auth,
            @RequestParam("descripcion") @NotBlank String descripcion,
            @RequestParam(value = "descripcionCompleta", required = false) String descripcionCompleta,
            @RequestParam(value = "precioSugerido", required = false) @Positive BigDecimal precioSugerido,
            @RequestParam("fotos") MultipartFile[] fotos) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteService.solicitarItem(auth.getName(), descripcion, descripcionCompleta, precioSugerido, fotos));
    }

    @GetMapping("/me/solicitudes-items")
    public ResponseEntity<List<SolicitudItemResponse>> listarMisSolicitudes(Authentication auth) {
        return ResponseEntity.ok(clienteService.listarMisSolicitudes(auth.getName()));
    }
}
