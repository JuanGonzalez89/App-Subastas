-- ============================================================
-- MIGRACIÓN SPRINT 6 — Flujo completo de solicitud de ítem
-- ============================================================

-- Ampliar estado y agregar campos del flujo completo
ALTER TABLE solicitudes_items ALTER COLUMN estado TYPE VARCHAR(30);

ALTER TABLE solicitudes_items
  ADD COLUMN IF NOT EXISTS motivo_rechazo     VARCHAR(500),
  ADD COLUMN IF NOT EXISTS direccion_envio    VARCHAR(250),
  ADD COLUMN IF NOT EXISTS valor_base         DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS comision           DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS fecha_subasta      DATE,
  ADD COLUMN IF NOT EXISTS hora_subasta       TIME,
  ADD COLUMN IF NOT EXISTS lugar_subasta      VARCHAR(250),
  ADD COLUMN IF NOT EXISTS deposito_ubicacion VARCHAR(250),
  ADD COLUMN IF NOT EXISTS poliza_seguro      VARCHAR(250);
