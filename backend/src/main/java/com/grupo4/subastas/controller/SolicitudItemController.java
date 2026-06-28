package com.grupo4.subastas.controller;

import com.grupo4.subastas.dto.request.ProponerCondicionesRequest;
import com.grupo4.subastas.dto.response.SolicitudItemResponse;
import com.grupo4.subastas.service.SolicitudItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/solicitudes-items")
@RequiredArgsConstructor
public class SolicitudItemController {

    private final SolicitudItemService solicitudItemService;

    @GetMapping
    public ResponseEntity<List<SolicitudItemResponse>> listarTodas() {
        return ResponseEntity.ok(solicitudItemService.listarTodas());
    }

    @PostMapping("/{id}/interes")
    public ResponseEntity<SolicitudItemResponse> mostrarInteres(
            @PathVariable Integer id,
            @RequestParam String direccionEnvio) {
        return ResponseEntity.ok(solicitudItemService.mostrarInteres(id, direccionEnvio));
    }

    @PostMapping("/{id}/inspeccion")
    public ResponseEntity<SolicitudItemResponse> marcarEnInspeccion(@PathVariable Integer id) {
        return ResponseEntity.ok(solicitudItemService.marcarEnInspeccion(id));
    }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<SolicitudItemResponse> rechazarItem(
            @PathVariable Integer id,
            @RequestParam String motivo) {
        return ResponseEntity.ok(solicitudItemService.rechazarItem(id, motivo));
    }

    @PostMapping("/{id}/condiciones")
    public ResponseEntity<SolicitudItemResponse> proponerCondiciones(
            @PathVariable Integer id,
            @Valid @RequestBody ProponerCondicionesRequest request) {
        return ResponseEntity.ok(solicitudItemService.proponerCondiciones(id, request));
    }
}
