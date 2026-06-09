-- ============================================================
-- ESQUEMA DEL PROFESOR - Adaptado de T-SQL a PostgreSQL
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS paises (
    numero      INT         NOT NULL,
    nombre      VARCHAR(250) NOT NULL,
    nombrecorto VARCHAR(250),
    capital     VARCHAR(250) NOT NULL,
    nacionalidad VARCHAR(250) NOT NULL,
    idiomas     VARCHAR(150) NOT NULL,
    CONSTRAINT pk_paises PRIMARY KEY (numero)
);

CREATE TABLE IF NOT EXISTS personas (
    identificador SERIAL       NOT NULL,
    documento     VARCHAR(20)  NOT NULL,
    nombre        VARCHAR(150) NOT NULL,
    apellido      VARCHAR(150),
    email         VARCHAR(250) UNIQUE,
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
    identificador    SERIAL       NOT NULL,
    nombresector     VARCHAR(150) NOT NULL,
    codigosector     VARCHAR(10),
    responsablesector INT,
    CONSTRAINT pk_sectores PRIMARY KEY (identificador),
    CONSTRAINT fk_sectores_empleados FOREIGN KEY (responsablesector) REFERENCES empleados(identificador)
);

CREATE TABLE IF NOT EXISTS seguros (
    nropoliza       VARCHAR(30)  NOT NULL,
    compania        VARCHAR(150) NOT NULL,
    polizacombinada VARCHAR(2)   CHECK (polizacombinada IN ('si','no')),
    importe         DECIMAL(18,2) NOT NULL CHECK (importe > 0),
    CONSTRAINT pk_seguro PRIMARY KEY (nropoliza)
);

CREATE TABLE IF NOT EXISTS clientes (
    identificador INT         NOT NULL,
    numeropais    INT,
    admitido      VARCHAR(2)  CHECK (admitido IN ('si','no')),
    categoria     VARCHAR(10) CHECK (categoria IN ('comun','especial','plata','oro','platino')),
    verificador   INT         NOT NULL,
    clavepersonal VARCHAR(255),
    CONSTRAINT pk_clientes PRIMARY KEY (identificador),
    CONSTRAINT fk_clientes_personas FOREIGN KEY (identificador) REFERENCES personas(identificador),
    CONSTRAINT fk_clientes_empleados FOREIGN KEY (verificador) REFERENCES empleados(identificador),
    CONSTRAINT fk_clientes_paises FOREIGN KEY (numeropais) REFERENCES paises(numero)
);

CREATE TABLE IF NOT EXISTS duenios (
    identificador           INT NOT NULL,
    numeropais              INT,
    verificacionfinanciera  VARCHAR(2) CHECK (verificacionfinanciera IN ('si','no')),
    verificacionjudicial    VARCHAR(2) CHECK (verificacionjudicial IN ('si','no')),
    calificacionriesgo      INT CHECK (calificacionriesgo IN (1,2,3,4,5,6)),
    verificador             INT NOT NULL,
    CONSTRAINT pk_duenios PRIMARY KEY (identificador),
    CONSTRAINT fk_duenios_personas FOREIGN KEY (identificador) REFERENCES personas(identificador),
    CONSTRAINT fk_duenios_empleados FOREIGN KEY (verificador) REFERENCES empleados(identificador)
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
    fecha               DATE         CHECK (fecha > NOW() + INTERVAL '10 days'),
    hora                TIME         NOT NULL,
    estado              VARCHAR(10)  CHECK (estado IN ('abierta','cerrada')),
    subastador          INT,
    ubicacion           VARCHAR(350),
    capacidadasistentes INT,
    tienedeposito       VARCHAR(2)   CHECK (tienedeposito IN ('si','no')),
    seguridadpropia     VARCHAR(2)   CHECK (seguridadpropia IN ('si','no')),
    categoria           VARCHAR(10)  CHECK (categoria IN ('comun','especial','plata','oro','platino')),
    moneda              VARCHAR(3)   DEFAULT 'ARS' CHECK (moneda IN ('ARS','USD')),
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
    CONSTRAINT fk_productos_duenios FOREIGN KEY (duenio) REFERENCES duenios(identificador)
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
    CONSTRAINT fk_catalogos_subastas FOREIGN KEY (subasta) REFERENCES subastas(identificador)
);

CREATE TABLE IF NOT EXISTS itemscatalogo (
    identificador SERIAL        NOT NULL,
    catalogo      INT           NOT NULL,
    producto      INT           NOT NULL,
    preciobase    DECIMAL(18,2) NOT NULL CHECK (preciobase > 0.01),
    comision      DECIMAL(18,2) NOT NULL CHECK (comision > 0.01),
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
    CONSTRAINT fk_asistentes_subasta FOREIGN KEY (subasta) REFERENCES subastas(identificador)
);

CREATE TABLE IF NOT EXISTS pujos (
    identificador SERIAL        NOT NULL,
    asistente     INT           NOT NULL,
    item          INT           NOT NULL,
    importe       DECIMAL(18,2) NOT NULL CHECK (importe > 0.01),
    ganador       VARCHAR(2)    DEFAULT 'no' CHECK (ganador IN ('si','no')),
    fechahora     TIMESTAMP     DEFAULT NOW(),
    CONSTRAINT pk_pujos PRIMARY KEY (identificador),
    CONSTRAINT fk_pujos_asistentes FOREIGN KEY (asistente) REFERENCES asistentes(identificador),
    CONSTRAINT fk_pujos_itemscatalogo FOREIGN KEY (item) REFERENCES itemscatalogo(identificador)
);

CREATE TABLE IF NOT EXISTS registrodesubasta (
    identificador SERIAL        NOT NULL,
    subasta       INT           NOT NULL,
    duenio        INT           NOT NULL,
    producto      INT           NOT NULL,
    cliente       INT           NOT NULL,
    importe       DECIMAL(18,2) NOT NULL CHECK (importe > 0.01),
    comision      DECIMAL(18,2) NOT NULL CHECK (comision > 0.01),
    CONSTRAINT pk_registrodesubasta PRIMARY KEY (identificador),
    CONSTRAINT fk_rds_subastas FOREIGN KEY (subasta) REFERENCES subastas(identificador),
    CONSTRAINT fk_rds_duenios FOREIGN KEY (duenio) REFERENCES duenios(identificador),
    CONSTRAINT fk_rds_producto FOREIGN KEY (producto) REFERENCES productos(identificador),
    CONSTRAINT fk_rds_cliente FOREIGN KEY (cliente) REFERENCES clientes(identificador)
);
