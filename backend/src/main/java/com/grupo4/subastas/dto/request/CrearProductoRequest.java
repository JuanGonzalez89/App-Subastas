package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CrearProductoRequest {
    @NotBlank
    private String descripcionCatalogo;

    @Size(max = 300)
    private String descripcionCompleta;

    @NotNull
    private Integer duenio;
}
