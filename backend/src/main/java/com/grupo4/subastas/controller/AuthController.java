package com.grupo4.subastas.controller;

import com.grupo4.subastas.dto.request.LoginRequest;
import com.grupo4.subastas.dto.request.RegistroStep1Request;
import com.grupo4.subastas.dto.request.RegistroStep2Request;
import com.grupo4.subastas.dto.response.AuthResponse;
import com.grupo4.subastas.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/registro/paso1")
    public ResponseEntity<Map<String, String>> registroPaso1(@Valid @RequestBody RegistroStep1Request request) {
        authService.registroPaso1(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensaje", "Solicitud recibida. La empresa verificará tus datos y recibirás un email de confirmación."));
    }

    @PostMapping("/registro/paso2")
    public ResponseEntity<Map<String, String>> registroPaso2(@Valid @RequestBody RegistroStep2Request request) {
        authService.registroPaso2(request);
        return ResponseEntity.ok(Map.of("mensaje", "Registro completado. Ya podés iniciar sesión."));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // Endpoint para que el admin apruebe una pre-registración (testear con Postman)
    @PostMapping("/admin/aprobar/{preRegistracionId}")
    public ResponseEntity<Map<String, String>> aprobarRegistro(
            @PathVariable Integer preRegistracionId,
            @RequestParam String categoria) {
        authService.aprobarRegistro(preRegistracionId, categoria);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario aprobado. Se envió el email de confirmación."));
    }
}
