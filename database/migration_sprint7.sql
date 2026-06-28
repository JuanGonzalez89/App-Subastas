-- ============================================================
-- MIGRACIÓN SPRINT 7
-- Cierre de subasta, pago de lo ganado, multas y plazo de 72 hs.
-- Ejecutar UNA vez sobre la base 'subastas'.
-- ============================================================

-- 1) Tabla de multas (10% del valor ofertado, plazo 72 hs)
CREATE TABLE IF NOT EXISTS multas (
    identificador  SERIAL        PRIMARY KEY,
    cliente        INT           NOT NULL REFERENCES clientes(identificador),
    importe        DECIMAL(18,2) NOT NULL,
    motivo         VARCHAR(300),
    estado         VARCHAR(15)   DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagada')),
    fecha_limite   TIMESTAMP,
    fecha_creacion TIMESTAMP     DEFAULT NOW(),
    registro       INT
);

-- 2) Extensión de registrodesubasta para gestionar el pago del comprador
ALTER TABLE registrodesubasta
    ADD COLUMN IF NOT EXISTS costo_envio DECIMAL(18,2),
    ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(15) DEFAULT 'pendiente',
    ADD COLUMN IF NOT EXISTS medio_pago  INT,
    ADD COLUMN IF NOT EXISTS fecha_pago  TIMESTAMP;
