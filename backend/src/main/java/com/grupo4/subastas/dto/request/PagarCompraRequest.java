package com.grupo4.subastas.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PagarCompraRequest {
    @NotNull
    private Integer medioPagoId;
}
