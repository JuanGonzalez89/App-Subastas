package com.grupo4.subastas.model.enums;

public enum CategoriaUsuario {
    COMUN("comun"),
    ESPECIAL("especial"),
    PLATA("plata"),
    ORO("oro"),
    PLATINO("platino");

    private final String valor;

    CategoriaUsuario(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static CategoriaUsuario fromValor(String valor) {
        for (CategoriaUsuario c : values()) {
            if (c.valor.equalsIgnoreCase(valor)) return c;
        }
        throw new IllegalArgumentException("Categoría inválida: " + valor);
    }
}
