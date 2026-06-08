package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegistroStep1Request {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    private String email;

    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    private String documentoFrente;
    private String documentoDorso;
    private String domicilio;
    private Integer numeroPais;
}
