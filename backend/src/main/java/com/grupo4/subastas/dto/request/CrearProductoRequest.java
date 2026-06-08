package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearProductoRequest {
    @NotBlank
    private String descripcionCatalogo;

    private String descripcionCompleta;
}
