package com.grupo4.subastas.controller;

import com.grupo4.subastas.dto.request.PujaRequest;
import com.grupo4.subastas.dto.response.ConectarResponse;
import com.grupo4.subastas.dto.response.PujaResponse;
import com.grupo4.subastas.service.PujaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subastas")
@RequiredArgsConstructor
public class PujaController {

    private final PujaService pujaService;

    /**
     * Inscribirse / conectarse a una subasta.
     * Crea un registro en asistentes si no existe.
     */
    @PostMapping("/{id}/conectar")
    public ResponseEntity<ConectarResponse> conectar(
            @PathVariable Integer id,
            Authentication auth) {
        return ResponseEntity.ok(pujaService.conectar(id, auth.getName()));
    }

    /**
     * Registrar una puja en la subasta.
     * Valida rango: ofertaActual + 1% precioBase <= monto <= ofertaActual + 20% precioBase
     */
    @PostMapping("/{id}/pujas")
    public ResponseEntity<PujaResponse> pujar(
            @PathVariable Integer id,
            Authentication auth,
            @Valid @RequestBody PujaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pujaService.pujar(id, auth.getName(), request));
    }

    /**
     * Listar pujas de un ítem en una subasta, de mayor a menor oferta.
     * Requiere autenticación para marcar cuáles son del usuario (esPropio).
     */
    @GetMapping("/{id}/pujas")
    public ResponseEntity<List<PujaResponse>> listarPujas(
            @PathVariable Integer id,
            @RequestParam Integer itemId,
            Authentication auth) {
        return ResponseEntity.ok(pujaService.listarPujas(id, itemId, auth.getName()));
    }
}
