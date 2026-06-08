package com.grupo4.subastas.controller;

import com.grupo4.subastas.dto.response.ItemResponse;
import com.grupo4.subastas.dto.response.SubastaResponse;
import com.grupo4.subastas.service.SubastaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subastas")
@RequiredArgsConstructor
public class SubastaController {

    private final SubastaService subastaService;

    @GetMapping
    public ResponseEntity<List<SubastaResponse>> listar(
            @RequestParam(required = false) String categoria,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(subastaService.listarSubastas(categoria, email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubastaResponse> detalle(
            @PathVariable Integer id,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(subastaService.obtenerSubasta(id, email));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<ItemResponse>> items(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        boolean mostrarPrecios = authHeader != null && authHeader.startsWith("Bearer ");
        return ResponseEntity.ok(subastaService.listarItems(id, mostrarPrecios));
    }
}
