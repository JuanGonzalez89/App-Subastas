package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String tipo;
    private UsuarioResponse usuario;
}
