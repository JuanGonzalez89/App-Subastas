-- ============================================================
-- SCRIPT DE INICIALIZACIÓN COMPLETO — Sistema de Subastas
-- Grupo 4 - DAI 1C2026 - UADE
--
-- INSTRUCCIONES:
-- 1. Abrí pgAdmin o psql como usuario postgres
-- 2. Creá la base de datos:   CREATE DATABASE subastas;
-- 3. Conectate a ella:        \c subastas   (en psql)
--    o seleccioná "subastas" en pgAdmin
-- 4. Ejecutá este script completo
-- ============================================================


-- ============================================================
-- PARTE 1: ESQUEMA BASE (tablas del profesor — sin modificar)
-- ============================================================

CREATE TABLE IF NOT EXISTS paises (
    numero       INT          NOT NULL,
    nombre       VARCHAR(250) NOT NULL,
    nombrecorto  VARCHAR(250),
    capital      VARCHAR(250) NOT NULL,
    nacionalidad VARCHAR(250) NOT NULL,
    idiomas      VARCHAR(150) NOT NULL,
    CONSTRAINT pk_paises PRIMARY KEY (numero)
);

CREATE TABLE IF NOT EXISTS personas (
    identificador SERIAL       NOT NULL,
    documento     VARCHAR(20)  NOT NULL,
    nombre        VARCHAR(150) NOT NULL,
    direccion     VARCHAR(250),
    estado        VARCHAR(15)  CHECK (estado IN ('activo', 'inactivo')),
    foto          BYTEA,
    CONSTRAINT pk_personas PRIMARY KEY (identificador)
);

CREATE TABLE IF NOT EXISTS empleados (
    identificador INT          NOT NULL,
    cargo         VARCHAR(100),
    sector        INT,
    CONSTRAINT pk_empleados PRIMARY KEY (identificador),
    CONSTRAINT fk_empleados_personas FOREIGN KEY (identificador) REFERENCES personas(identificador)
);

CREATE TABLE IF NOT EXISTS sectores (
    identificador     SERIAL       NOT NULL,
    nombresector      VARCHAR(150) NOT NULL,
    codigosector      VARCHAR(10),
    responsablesector INT,
    CONSTRAINT pk_sectores PRIMARY KEY (identificador),
    CONSTRAINT fk_sectores_empleados FOREIGN KEY (responsablesector) REFERENCES empleados(identificador)
);

CREATE TABLE IF NOT EXISTS seguros (
    nropoliza       VARCHAR(30)   NOT NULL,
    compania        VARCHAR(150)  NOT NULL,
    polizacombinada VARCHAR(2)    CHECK (polizacombinada IN ('si','no')),
    importe         DECIMAL(18,2) NOT NULL CHECK (importe > 0),
    CONSTRAINT pk_seguro PRIMARY KEY (nropoliza)
);

CREATE TABLE IF NOT EXISTS clientes (
    identificador INT         NOT NULL,
    numeropais    INT,
    admitido      VARCHAR(2)  CHECK (admitido IN ('si','no')),
    categoria     VARCHAR(10) CHECK (categoria IN ('comun','especial','plata','oro','platino')),
    verificador   INT         NOT NULL,
    CONSTRAINT pk_clientes PRIMARY KEY (identificador),
    CONSTRAINT fk_clientes_personas  FOREIGN KEY (identificador) REFERENCES personas(identificador),
    CONSTRAINT fk_clientes_empleados FOREIGN KEY (verificador)   REFERENCES empleados(identificador),
    CONSTRAINT fk_clientes_paises    FOREIGN KEY (numeropais)    REFERENCES paises(numero)
);

CREATE TABLE IF NOT EXISTS duenios (
    identificador          INT NOT NULL,
    numeropais             INT,
    verificacionfinanciera VARCHAR(2) CHECK (verificacionfinanciera IN ('si','no')),
    verificacionjudicial   VARCHAR(2) CHECK (verificacionjudicial   IN ('si','no')),
    calificacionriesgo     INT CHECK (calificacionriesgo IN (1,2,3,4,5,6)),
    verificador            INT NOT NULL,
    CONSTRAINT pk_duenios PRIMARY KEY (identificador),
    CONSTRAINT fk_duenios_personas  FOREIGN KEY (identificador) REFERENCES personas(identificador),
    CONSTRAINT fk_duenios_empleados FOREIGN KEY (verificador)   REFERENCES empleados(identificador)
);

CREATE TABLE IF NOT EXISTS subastadores (
    identificador INT         NOT NULL,
    matricula     VARCHAR(15),
    region        VARCHAR(50),
    CONSTRAINT pk_subastadores PRIMARY KEY (identificador),
    CONSTRAINT fk_subastadores_personas FOREIGN KEY (identificador) REFERENCES personas(identificador)
);

CREATE TABLE IF NOT EXISTS subastas (
    identificador       SERIAL       NOT NULL,
    fecha               DATE,
    hora                TIME         NOT NULL,
    estado              VARCHAR(10)  CHECK (estado IN ('abierta','cerrada')),
    subastador          INT,
    ubicacion           VARCHAR(350),
    capacidadasistentes INT,
    tienedeposito       VARCHAR(2)   CHECK (tienedeposito  IN ('si','no')),
    seguridadpropia     VARCHAR(2)   CHECK (seguridadpropia IN ('si','no')),
    categoria           VARCHAR(10)  CHECK (categoria IN ('comun','especial','plata','oro','platino')),
    CONSTRAINT pk_subastas PRIMARY KEY (identificador),
    CONSTRAINT fk_subastas_subastadores FOREIGN KEY (subastador) REFERENCES subastadores(identificador)
);

CREATE TABLE IF NOT EXISTS productos (
    identificador       SERIAL       NOT NULL,
    fecha               DATE,
    disponible          VARCHAR(2)   CHECK (disponible IN ('si','no')),
    descripcioncatalogo VARCHAR(500) DEFAULT 'No Posee',
    descripcioncompleta VARCHAR(300) NOT NULL,
    revisor             INT          NOT NULL,
    duenio              INT          NOT NULL,
    seguro              VARCHAR(30),
    CONSTRAINT pk_productos PRIMARY KEY (identificador),
    CONSTRAINT fk_productos_empleados FOREIGN KEY (revisor) REFERENCES empleados(identificador),
    CONSTRAINT fk_productos_duenios   FOREIGN KEY (duenio)  REFERENCES duenios(identificador)
);

CREATE TABLE IF NOT EXISTS fotos (
    identificador INT   NOT NULL GENERATED ALWAYS AS IDENTITY,
    producto      INT   NOT NULL,
    foto          BYTEA NOT NULL,
    CONSTRAINT pk_fotos PRIMARY KEY (identificador),
    CONSTRAINT fk_fotos_productos FOREIGN KEY (producto) REFERENCES productos(identificador)
);

CREATE TABLE IF NOT EXISTS catalogos (
    identificador SERIAL       NOT NULL,
    descripcion   VARCHAR(250) NOT NULL,
    subasta       INT,
    responsable   INT          NOT NULL,
    CONSTRAINT pk_catalogos PRIMARY KEY (identificador),
    CONSTRAINT fk_catalogos_empleados FOREIGN KEY (responsable) REFERENCES empleados(identificador),
    CONSTRAINT fk_catalogos_subastas  FOREIGN KEY (subasta)     REFERENCES subastas(identificador)
);

CREATE TABLE IF NOT EXISTS itemscatalogo (
    identificador SERIAL        NOT NULL,
    catalogo      INT           NOT NULL,
    producto      INT           NOT NULL,
    preciobase    DECIMAL(18,2) NOT NULL CHECK (preciobase > 0.01),
    comision      DECIMAL(18,2) NOT NULL CHECK (comision   > 0.01),
    subastado     VARCHAR(2)    CHECK (subastado IN ('si','no')),
    CONSTRAINT pk_itemscatalogo PRIMARY KEY (identificador),
    CONSTRAINT fk_itemscatalogo_catalogos FOREIGN KEY (catalogo) REFERENCES catalogos(identificador),
    CONSTRAINT fk_itemscatalogo_productos FOREIGN KEY (producto) REFERENCES productos(identificador)
);

CREATE TABLE IF NOT EXISTS asistentes (
    identificador SERIAL NOT NULL,
    numeropostor  INT    NOT NULL,
    cliente       INT    NOT NULL,
    subasta       INT    NOT NULL,
    CONSTRAINT pk_asistentes PRIMARY KEY (identificador),
    CONSTRAINT fk_asistentes_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador),
    CONSTRAINT fk_asistentes_subasta  FOREIGN KEY (subasta) REFERENCES subastas(identificador),
    CONSTRAINT uq_asistentes_cliente_subasta UNIQUE (cliente, subasta)
);

CREATE TABLE IF NOT EXISTS pujos (
    identificador SERIAL        NOT NULL,
    asistente     INT           NOT NULL,
    item          INT           NOT NULL,
    importe       DECIMAL(18,2) NOT NULL CHECK (importe > 0.01),
    ganador       VARCHAR(2)    DEFAULT 'no' CHECK (ganador IN ('si','no')),
    CONSTRAINT pk_pujos PRIMARY KEY (identificador),
    CONSTRAINT fk_pujos_asistentes    FOREIGN KEY (asistente) REFERENCES asistentes(identificador),
    CONSTRAINT fk_pujos_itemscatalogo FOREIGN KEY (item)      REFERENCES itemscatalogo(identificador)
);

CREATE TABLE IF NOT EXISTS registrodesubasta (
    identificador SERIAL        NOT NULL,
    subasta       INT           NOT NULL,
    duenio        INT           NOT NULL,
    producto      INT           NOT NULL,
    cliente       INT           NOT NULL,
    importe       DECIMAL(18,2) NOT NULL CHECK (importe  > 0.01),
    comision      DECIMAL(18,2) NOT NULL CHECK (comision > 0.01),
    CONSTRAINT pk_registrodesubasta PRIMARY KEY (identificador),
    CONSTRAINT fk_rds_subastas  FOREIGN KEY (subasta)  REFERENCES subastas(identificador),
    CONSTRAINT fk_rds_duenios   FOREIGN KEY (duenio)   REFERENCES duenios(identificador),
    CONSTRAINT fk_rds_producto  FOREIGN KEY (producto) REFERENCES productos(identificador),
    CONSTRAINT fk_rds_cliente   FOREIGN KEY (cliente)  REFERENCES clientes(identificador)
);


-- ============================================================
-- PARTE 2: TABLAS PROPIAS (columnas extra + sprints)
-- ============================================================

-- Datos extra de login/perfil que no pueden ir en personas ni clientes
CREATE TABLE IF NOT EXISTS usuarios (
    identificador INT          NOT NULL,
    apellido      VARCHAR(150),
    email         VARCHAR(250) UNIQUE,
    clavepersonal VARCHAR(255),
    rol           VARCHAR(10)  DEFAULT 'USER',
    CONSTRAINT pk_usuarios PRIMARY KEY (identificador),
    CONSTRAINT fk_usuarios_personas FOREIGN KEY (identificador) REFERENCES personas(identificador)
);

-- Datos extra de subasta (moneda) que no pueden ir en subastas
CREATE TABLE IF NOT EXISTS subastas_ext (
    subasta INT        NOT NULL,
    moneda  VARCHAR(3) DEFAULT 'ARS',
    CONSTRAINT pk_subastas_ext PRIMARY KEY (subasta),
    CONSTRAINT fk_subastas_ext_subastas FOREIGN KEY (subasta) REFERENCES subastas(identificador)
);

-- Datos extra de pujos (fechahora) que no pueden ir en pujos
CREATE TABLE IF NOT EXISTS pujos_ext (
    pujo      INT       NOT NULL,
    fechahora TIMESTAMP DEFAULT NOW(),
    CONSTRAINT pk_pujos_ext PRIMARY KEY (pujo),
    CONSTRAINT fk_pujos_ext_pujos FOREIGN KEY (pujo) REFERENCES pujos(identificador)
);

-- Pre-registraciones (sprint 1)
CREATE TABLE IF NOT EXISTS preregistraciones (
    identificador   SERIAL       NOT NULL,
    nombre          VARCHAR(150) NOT NULL,
    apellido        VARCHAR(150) NOT NULL,
    email           VARCHAR(250) NOT NULL UNIQUE,
    numerodocumento VARCHAR(20)  NOT NULL,
    documentofrente TEXT,
    documentodorso  TEXT,
    domicilio       VARCHAR(250),
    numeropais      INT,
    fechasolicitud  TIMESTAMP    DEFAULT NOW(),
    estado          VARCHAR(15)  DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','aprobado','rechazado')),
    CONSTRAINT pk_preregistraciones PRIMARY KEY (identificador)
);

-- Tokens de confirmación (sprint 1)
CREATE TABLE IF NOT EXISTS tokensconfirmacion (
    identificador   SERIAL       NOT NULL,
    clienteid       INT          NOT NULL,
    token           VARCHAR(100) NOT NULL UNIQUE,
    fechaexpiracion TIMESTAMP    NOT NULL,
    usado           VARCHAR(2)   DEFAULT 'no' CHECK (usado IN ('si','no')),
    CONSTRAINT pk_tokensconfirmacion PRIMARY KEY (identificador),
    CONSTRAINT fk_tokens_clientes FOREIGN KEY (clienteid) REFERENCES clientes(identificador)
);

-- Medios de pago (sprint 3)
CREATE TABLE IF NOT EXISTS mediospago (
    identificador    SERIAL        NOT NULL,
    cliente          INT           NOT NULL,
    tipo             VARCHAR(30)   NOT NULL
        CHECK (tipo IN ('cuenta_bancaria','tarjeta_credito','cheque_certificado')),
    entidad          VARCHAR(150)  NOT NULL,
    numero           VARCHAR(100)  NOT NULL,
    montogarantizado DECIMAL(18,2),
    verificado       VARCHAR(2)    DEFAULT 'no' CHECK (verificado IN ('si','no')),
    CONSTRAINT pk_mediospago PRIMARY KEY (identificador),
    CONSTRAINT fk_mediospago_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador)
);

-- Solicitudes de items (sprint 5)
CREATE TABLE IF NOT EXISTS solicitudes_items (
    identificador        SERIAL        PRIMARY KEY,
    cliente              INTEGER       NOT NULL REFERENCES clientes(identificador),
    descripcion          VARCHAR(500)  NOT NULL,
    descripcion_completa VARCHAR(500),
    precio_sugerido      DECIMAL(18,2),
    estado               VARCHAR(20)   DEFAULT 'pendiente',
    fecha_solicitud      DATE          DEFAULT CURRENT_DATE
);

-- Fotos de solicitudes (sprint 5)
CREATE TABLE IF NOT EXISTS solicitudes_fotos (
    identificador  SERIAL  PRIMARY KEY,
    solicitud_item INTEGER NOT NULL REFERENCES solicitudes_items(identificador),
    foto           BYTEA,
    orden          INTEGER
);


-- ============================================================
-- PARTE 3: ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_productos_revisor        ON productos(revisor);
CREATE INDEX IF NOT EXISTS idx_productos_duenio         ON productos(duenio);
CREATE INDEX IF NOT EXISTS idx_catalogos_subasta        ON catalogos(subasta);
CREATE INDEX IF NOT EXISTS idx_itemscatalogo_catalogo   ON itemscatalogo(catalogo);
CREATE INDEX IF NOT EXISTS idx_itemscatalogo_producto   ON itemscatalogo(producto);
CREATE INDEX IF NOT EXISTS idx_asistentes_cliente       ON asistentes(cliente);
CREATE INDEX IF NOT EXISTS idx_asistentes_subasta       ON asistentes(subasta);
CREATE INDEX IF NOT EXISTS idx_pujos_asistente          ON pujos(asistente);
CREATE INDEX IF NOT EXISTS idx_pujos_item               ON pujos(item);
CREATE INDEX IF NOT EXISTS idx_solicitudes_items_cliente ON solicitudes_items(cliente);
CREATE INDEX IF NOT EXISTS idx_tokensconfirmacion_token  ON tokensconfirmacion(token);


-- ============================================================
-- PARTE 4: DATOS SEMILLA
-- ============================================================

-- Países
INSERT INTO paises (numero, nombre, nombrecorto, capital, nacionalidad, idiomas) VALUES
  (1,  'Argentina',      'AR', 'Buenos Aires',   'Argentino/a',    'Español'),
  (2,  'Brasil',         'BR', 'Brasilia',        'Brasileño/a',    'Portugués'),
  (3,  'Uruguay',        'UY', 'Montevideo',      'Uruguayo/a',     'Español'),
  (4,  'Chile',          'CL', 'Santiago',        'Chileno/a',      'Español'),
  (5,  'Paraguay',       'PY', 'Asunción',        'Paraguayo/a',    'Español, Guaraní'),
  (6,  'Bolivia',        'BO', 'Sucre',           'Boliviano/a',    'Español'),
  (7,  'Colombia',       'CO', 'Bogotá',          'Colombiano/a',   'Español'),
  (8,  'Perú',           'PE', 'Lima',            'Peruano/a',      'Español'),
  (9,  'Estados Unidos', 'US', 'Washington D.C.', 'Estadounidense', 'Inglés'),
  (10, 'España',         'ES', 'Madrid',          'Español/a',      'Español')
ON CONFLICT (numero) DO NOTHING;

-- Empleado SISTEMA (requerido como FK verificador en clientes y duenios)
DO $$
DECLARE
    v_id INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM personas WHERE documento = 'SISTEMA') THEN
        INSERT INTO personas (documento, nombre, estado)
        VALUES ('SISTEMA', 'Sistema Automatico', 'activo')
        RETURNING identificador INTO v_id;

        INSERT INTO empleados (identificador, cargo)
        VALUES (v_id, 'SISTEMA');
    END IF;
END $$;

