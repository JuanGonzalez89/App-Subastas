-- Sprint 5: Historial + Subastar Artículo

CREATE TABLE IF NOT EXISTS solicitudes_items (
    identificador        SERIAL PRIMARY KEY,
    cliente              INTEGER NOT NULL REFERENCES clientes(identificador),
    descripcion          VARCHAR(500) NOT NULL,
    descripcion_completa VARCHAR(500),
    precio_sugerido      DECIMAL(18,2),
    estado               VARCHAR(20) DEFAULT 'pendiente',
    fecha_solicitud      DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS solicitudes_fotos (
    identificador    SERIAL  PRIMARY KEY,
    solicitud_item   INTEGER NOT NULL REFERENCES solicitudes_items(identificador),
    foto             BYTEA,
    orden            INTEGER
);

-- Índices para mejorar rendimiento en FKs
CREATE INDEX IF NOT EXISTS idx_productos_revisor         ON productos(revisor);
CREATE INDEX IF NOT EXISTS idx_productos_duenio          ON productos(duenio);
CREATE INDEX IF NOT EXISTS idx_catalogos_subasta         ON catalogos(subasta);
CREATE INDEX IF NOT EXISTS idx_itemscatalogo_catalogo    ON itemscatalogo(catalogo);
CREATE INDEX IF NOT EXISTS idx_itemscatalogo_producto    ON itemscatalogo(producto);
CREATE INDEX IF NOT EXISTS idx_asistentes_cliente        ON asistentes(cliente);
CREATE INDEX IF NOT EXISTS idx_asistentes_subasta        ON asistentes(subasta);
CREATE INDEX IF NOT EXISTS idx_pujos_asistente           ON pujos(asistente);
CREATE INDEX IF NOT EXISTS idx_pujos_item                ON pujos(item);
CREATE INDEX IF NOT EXISTS idx_solicitudes_items_cliente ON solicitudes_items(cliente);
CREATE INDEX IF NOT EXISTS idx_tokensconfirmacion_token  ON tokensconfirmacion(token);
