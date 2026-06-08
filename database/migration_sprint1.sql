-- ============================================================
-- MIGRACIÓN SPRINT 1 — Tablas y datos nuevos
-- Ejecutar DESPUÉS de schema_profesor_postgres.sql
-- ============================================================

-- 1. Tabla para pre-registraciones (Etapa 1 del registro)
CREATE TABLE IF NOT EXISTS preregistraciones (
    identificador  SERIAL       NOT NULL,
    nombre         VARCHAR(150) NOT NULL,
    apellido       VARCHAR(150) NOT NULL,
    email          VARCHAR(250) NOT NULL UNIQUE,
    numerodocumento VARCHAR(20) NOT NULL,
    documentofrente TEXT,
    documentodorso  TEXT,
    domicilio       VARCHAR(250),
    numeropais      INT,
    fechasolicitud  TIMESTAMP   DEFAULT NOW(),
    estado          VARCHAR(15) DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','aprobado','rechazado')),
    CONSTRAINT pk_preregistraciones PRIMARY KEY (identificador)
);

-- 2. Tabla para tokens de confirmación por email (Etapa 2)
CREATE TABLE IF NOT EXISTS tokensconfirmacion (
    identificador   SERIAL       NOT NULL,
    clienteid       INT          NOT NULL,
    token           VARCHAR(100) NOT NULL UNIQUE,
    fechaexpiracion TIMESTAMP    NOT NULL,
    usado           VARCHAR(2)   DEFAULT 'no' CHECK (usado IN ('si','no')),
    CONSTRAINT pk_tokensconfirmacion PRIMARY KEY (identificador),
    CONSTRAINT fk_tokens_clientes FOREIGN KEY (clienteid) REFERENCES clientes(identificador)
);

-- 3. Tabla de medios de pago
CREATE TABLE IF NOT EXISTS mediospago (
    identificador    SERIAL       NOT NULL,
    cliente          INT          NOT NULL,
    tipo             VARCHAR(30)  NOT NULL
        CHECK (tipo IN ('cuenta_bancaria','tarjeta_credito','cheque_certificado')),
    entidad          VARCHAR(150) NOT NULL,
    numero           VARCHAR(100) NOT NULL,
    montogarantizado DECIMAL(18,2),
    verificado       VARCHAR(2)   DEFAULT 'no' CHECK (verificado IN ('si','no')),
    CONSTRAINT pk_mediospago PRIMARY KEY (identificador),
    CONSTRAINT fk_mediospago_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador)
);

-- ============================================================
-- DATOS SEMILLA (SEED)
-- ============================================================

-- Países principales
INSERT INTO paises (numero, nombre, nombrecorto, capital, nacionalidad, idiomas)
VALUES
  (1,  'Argentina',        'AR', 'Buenos Aires',  'Argentino/a',   'Español'),
  (2,  'Brasil',           'BR', 'Brasilia',       'Brasileño/a',   'Portugués'),
  (3,  'Uruguay',          'UY', 'Montevideo',     'Uruguayo/a',    'Español'),
  (4,  'Chile',            'CL', 'Santiago',       'Chileno/a',     'Español'),
  (5,  'Paraguay',         'PY', 'Asunción',       'Paraguayo/a',   'Español, Guaraní'),
  (6,  'Bolivia',          'BO', 'Sucre',          'Boliviano/a',   'Español'),
  (7,  'Colombia',         'CO', 'Bogotá',         'Colombiano/a',  'Español'),
  (8,  'Perú',             'PE', 'Lima',           'Peruano/a',     'Español'),
  (9,  'Estados Unidos',   'US', 'Washington D.C.','Estadounidense','Inglés'),
  (10, 'España',           'ES', 'Madrid',         'Español/a',     'Español')
ON CONFLICT (numero) DO NOTHING;

-- Empleado SISTEMA (necesario para la FK verificador en clientes)
INSERT INTO personas (documento, nombre, apellido, email, estado)
VALUES ('SISTEMA', 'Sistema', 'Automático', 'sistema@subastas.com', 'activo')
ON CONFLICT (email) DO NOTHING;

INSERT INTO empleados (identificador, cargo)
SELECT identificador, 'SISTEMA'
FROM personas WHERE email = 'sistema@subastas.com'
ON CONFLICT (identificador) DO NOTHING;
