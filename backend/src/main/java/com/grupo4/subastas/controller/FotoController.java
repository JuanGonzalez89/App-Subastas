package com.grupo4.subastas.controller;

import com.grupo4.subastas.repository.FotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fotos")
@RequiredArgsConstructor
public class FotoController {

    private final FotoRepository fotoRepository;

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getFoto(@PathVariable Integer id) {
        return fotoRepository.findById(id)
                .filter(f -> f.getFoto() != null)
                .map(f -> ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(f.getFoto()))
                .orElse(ResponseEntity.notFound().build());
    }
}
