package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegistroStep2Request {

    @NotBlank(message = "El token es obligatorio")
    private String token;

    @NotBlank(message = "La clave personal es obligatoria")
    @Size(min = 6, message = "La clave debe tener al menos 6 caracteres")
    private String clavePersonal;
}
