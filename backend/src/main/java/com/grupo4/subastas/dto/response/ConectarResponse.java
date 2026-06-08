package com.grupo4.subastas.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConectarResponse {
    private Integer asistenteId;
    private Integer numeroPostor;
}
