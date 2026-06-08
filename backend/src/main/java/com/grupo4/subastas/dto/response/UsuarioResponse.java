package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioResponse {
    private Integer id;
    private String nombre;
    private String apellido;
    private String email;
    private String categoria;
    private String admitido;
}
