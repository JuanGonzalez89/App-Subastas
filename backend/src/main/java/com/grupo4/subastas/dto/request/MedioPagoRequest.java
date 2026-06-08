package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MedioPagoRequest {

    @NotBlank
    @Pattern(regexp = "cuenta_bancaria|tarjeta_credito|cheque_certificado",
             message = "tipo debe ser cuenta_bancaria, tarjeta_credito o cheque_certificado")
    private String tipo;

    @NotBlank
    private String entidad;

    @NotBlank
    private String numero;

    private BigDecimal montoGarantizado;
}
