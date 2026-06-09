package com.grupo4.subastas.controller;

import com.grupo4.subastas.model.entity.SolicitudFoto;
import com.grupo4.subastas.repository.SolicitudFotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/solicitudes-fotos")
@RequiredArgsConstructor
public class SolicitudFotoController {

    private final SolicitudFotoRepository solicitudFotoRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Integer>> subirFoto(@RequestParam("foto") MultipartFile archivo) throws IOException {
        SolicitudFoto foto = SolicitudFoto.builder()
                .foto(archivo.getBytes())
                .build();
        foto = solicitudFotoRepository.save(foto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", foto.getIdentificador()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getFoto(@PathVariable Integer id) {
        return solicitudFotoRepository.findById(id)
                .filter(f -> f.getFoto() != null)
                .map(f -> ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(f.getFoto()))
                .orElse(ResponseEntity.notFound().build());
    }
}
