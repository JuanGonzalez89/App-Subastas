-- ============================================================
-- MIGRACIÓN SPRINT 4 — Pujas en Tiempo Real
-- Las tablas asistentes y pujos vienen del esquema del profesor
-- Solo se ejecutan si no existen (por si acaso)
-- ============================================================

CREATE TABLE IF NOT EXISTS asistentes (
    identificador  SERIAL      NOT NULL,
    numeropostor   INT         NOT NULL,
    cliente        INT         NOT NULL,
    subasta        INT         NOT NULL,
    CONSTRAINT pk_asistentes PRIMARY KEY (identificador),
    CONSTRAINT fk_asistentes_clientes FOREIGN KEY (cliente)  REFERENCES clientes(identificador),
    CONSTRAINT fk_asistentes_subasta  FOREIGN KEY (subasta)  REFERENCES subastas(identificador),
    CONSTRAINT uq_asistentes_cliente_subasta UNIQUE (cliente, subasta)
);

CREATE TABLE IF NOT EXISTS pujos (
    identificador  SERIAL          NOT NULL,
    asistente      INT             NOT NULL,
    item           INT             NOT NULL,
    importe        DECIMAL(18,2)   NOT NULL CHECK (importe > 0.01),
    ganador        VARCHAR(2)      DEFAULT 'no' CHECK (ganador IN ('si','no')),
    fechahora      TIMESTAMP       DEFAULT NOW(),
    CONSTRAINT pk_pujos PRIMARY KEY (identificador),
    CONSTRAINT fk_pujos_asistentes   FOREIGN KEY (asistente) REFERENCES asistentes(identificador),
    CONSTRAINT fk_pujos_itemscatalogo FOREIGN KEY (item)      REFERENCES itemscatalogo(identificador)
);

-- En caso de que la tabla ya exista sin la columna (migración parcial)
ALTER TABLE pujos ADD COLUMN IF NOT EXISTS fechahora TIMESTAMP DEFAULT NOW();
