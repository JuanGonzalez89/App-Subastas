package com.grupo4.subastas.controller;

import com.grupo4.subastas.dto.response.ItemResponse;
import com.grupo4.subastas.service.SubastaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController {

    private final SubastaService subastaService;

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> detalle(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        boolean mostrarPrecios = authHeader != null && authHeader.startsWith("Bearer ");
        return ResponseEntity.ok(subastaService.obtenerItem(id, mostrarPrecios));
    }
}
