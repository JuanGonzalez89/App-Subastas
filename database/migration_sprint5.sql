-- Sprint 5: Historial + Subastar Artículo
-- Tabla para solicitudes de inclusión de artículos en subastas futuras

CREATE TABLE IF NOT EXISTS solicitudes_items (
    identificador  SERIAL PRIMARY KEY,
    cliente        INTEGER NOT NULL,
    descripcion    VARCHAR(500) NOT NULL,
    descripcion_completa VARCHAR(500),
    precio_sugerido DECIMAL(18,2),
    estado         VARCHAR(20) DEFAULT 'pendiente',
    fecha_solicitud DATE DEFAULT CURRENT_DATE
);
