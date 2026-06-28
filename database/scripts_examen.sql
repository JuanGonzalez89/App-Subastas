-- ============================================================
-- SCRIPTS PARA LA DEMO / EXAMEN
-- La empresa NO tiene cuenta de administrador: estas acciones (que en la
-- realidad hace la empresa) se ejecutan por script SQL.
--
-- Requisito previo: haber corrido migration_sprint7.sql (tabla multas +
-- columnas de pago en registrodesubasta).
--
-- Cómo usarlo:
--   psql -U postgres -d subastas -f database/scripts_examen.sql   (crea las funciones)
--   y luego llamás a cada función con SELECT (ver ejemplos al final).
-- ============================================================

-- ============================================================
-- INSTRUCTIVO COMPLETO DEL EXAMEN (paso a paso)
-- ============================================================
-- Las acciones de la EMPRESA tienen dos vías:
--   • Aprobar REGISTRO  -> por endpoint (manda el MAIL, como pide el documento).
--   • Resto (medio de pago, producto, cierre de subasta) -> por funciones SQL.
--
-- Comandos de PowerShell (la empresa los corre; cuentan como "script"):
--
--   # Aprobar un registro y ENVIAR EL MAIL con el token (categoria: comun/especial/plata/oro/platino)
--   Invoke-RestMethod -Method POST "http://localhost:8080/auth/registro/aprobar-por-email?email=USUARIO@gmail.com&categoria=comun"
--
-- ------------------------------------------------------------
-- PREPARAR LOS 2 USUARIOS (2 celulares)
-- ------------------------------------------------------------
-- 1) Cada usuario hace el PASO 1 en la app (datos + fotos del DNI).
-- 2) Ver las solicitudes pendientes:
--      SELECT identificador, nombre, apellido, email FROM preregistraciones WHERE estado='pendiente';
-- 3) Aprobar cada uno (le llega el MAIL con el token):
--      (PowerShell) Invoke-RestMethod -Method POST "http://localhost:8080/auth/registro/aprobar-por-email?email=MAIL&categoria=comun"
--    Alternativa sin mail (token en pantalla):  SELECT aprobar_registro('MAIL','comun');
-- 4) El usuario abre el mail, copia el token, completa el PASO 2 en la app y crea su clave.
-- 5) Cada usuario registra un medio de pago en la app. Verificarlo (la empresa lo verifica):
--      SELECT identificador, cliente, tipo, montogarantizado FROM mediospago;
--      SELECT verificar_medios_de('MAIL');          -- o: SELECT verificar_medio_pago(<id>);
--
-- ------------------------------------------------------------
-- PUNTOS 1 y 2 — CREAR PRODUCTO, APROBARLO POR SCRIPT Y PUJAR
-- ------------------------------------------------------------
-- 6) Un usuario sube un artículo en la app (Perfil -> Subastar artículo, >=6 fotos + casillero). Queda 'pendiente'.
-- 7) La empresa PROPONE condiciones (la solicitud NO se publica todavía):
--      SELECT identificador, descripcion FROM solicitudes_items WHERE estado='pendiente';
--      SELECT proponer_condiciones(<solicitudId>, 10000, 15);   -- valor base 10000, comision 15%
--    La solicitud queda en 'condiciones_propuestas'.
-- 7b) EL DUEÑO entra a la app (Perfil -> Subastar mi artículo) y ACEPTA las condiciones.
--     Recién al ACEPTAR, el producto se publica en la subasta de su categoría (queda para pujar).
-- 8) Ver el ítem publicado (para saber qué id se puja y luego cerrar):
--      SELECT ic.identificador AS item, p.descripcioncatalogo, ic.preciobase
--        FROM itemscatalogo ic JOIN productos p ON p.identificador=ic.producto ORDER BY ic.identificador DESC;
--    Los 2 celulares (OTROS usuarios, no el dueño) entran a la subasta y pujan alternados.
-- 9) Cerrar la subasta y adjudicar al ganador (item del paso 8):
--      SELECT cerrar_subasta_item(<itemId>);
--    El bien queda en "Mis compras" del ganador, pendiente de pago.
--
-- ------------------------------------------------------------
-- PUNTOS 3 y 5 — CHEQUE QUE EXCEDE EL LÍMITE -> MULTA + 72 HS
-- ------------------------------------------------------------
-- 10) El ganador registra un CHEQUE CERTIFICADO con monto garantizado MENOR al total. Verificarlo (paso 5).
-- 11) En la app: Mis compras -> Pagar -> elegir el cheque.
--     Como el monto no cubre el total, sale el AVISO de multa del 10% + 72 hs.
--     Queda con multa pendiente y no puede volver a pujar hasta abonarla.
--
-- ------------------------------------------------------------
-- PUNTO 4 — TRANSFERENCIA (pasar plata)
-- ------------------------------------------------------------
-- 12) En la app: Mis compras -> Pagar -> elegir cuenta bancaria o tarjeta (sin límite) -> PAGO EXITOSO.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1) APROBAR UN REGISTRO (etapa 1 -> aprobado)
--    Crea persona + usuario + cliente, genera el token y lo devuelve.
--    El usuario completa el registro (paso 2) con ese token.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION aprobar_registro(p_email VARCHAR, p_categoria VARCHAR DEFAULT 'comun')
RETURNS VARCHAR AS $$
DECLARE
    v_pre        preregistraciones%ROWTYPE;
    v_persona_id INT;
    v_token      VARCHAR;
    v_pais       INT;
BEGIN
    SELECT * INTO v_pre
      FROM preregistraciones
     WHERE email = p_email AND estado = 'pendiente'
     ORDER BY identificador DESC
     LIMIT 1;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No hay una preregistración pendiente para el email %', p_email;
    END IF;

    -- El país es opcional: si el valor no existe en la tabla paises, se deja NULL
    -- para no violar la clave foránea.
    v_pais := v_pre.numeropais;
    IF v_pais IS NOT NULL AND NOT EXISTS (SELECT 1 FROM paises WHERE numero = v_pais) THEN
        v_pais := NULL;
    END IF;

    INSERT INTO personas (documento, nombre, direccion, estado)
    VALUES (v_pre.numerodocumento, v_pre.nombre, v_pre.domicilio, 'activo')
    RETURNING identificador INTO v_persona_id;

    INSERT INTO usuarios (identificador, apellido, email, rol)
    VALUES (v_persona_id, v_pre.apellido, v_pre.email, 'USER');

    INSERT INTO clientes (identificador, numeropais, admitido, categoria, verificador)
    VALUES (v_persona_id, v_pais, 'si', p_categoria, 1);

    v_token := gen_random_uuid()::VARCHAR;
    INSERT INTO tokensconfirmacion (clienteid, token, fechaexpiracion, usado)
    VALUES (v_persona_id, v_token, NOW() + INTERVAL '48 hours', 'no');

    UPDATE preregistraciones SET estado = 'aprobado' WHERE identificador = v_pre.identificador;

    RAISE NOTICE '✔ Registro aprobado para %. TOKEN (para completar el paso 2): %', p_email, v_token;
    RETURN v_token;
END;
$$ LANGUAGE plpgsql;


-- ────────────────────────────────────────────────────────────
-- 2) VERIFICAR UN MEDIO DE PAGO (la empresa lo verifica antes de la subasta)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION verificar_medio_pago(p_medio_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE mediospago SET verificado = 'si' WHERE identificador = p_medio_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe el medio de pago %', p_medio_id;
    END IF;
    RAISE NOTICE '✔ Medio de pago % verificado', p_medio_id;
END;
$$ LANGUAGE plpgsql;

-- Verificar TODOS los medios de pago de un cliente (por email)
CREATE OR REPLACE FUNCTION verificar_medios_de(p_email VARCHAR)
RETURNS VOID AS $$
DECLARE v_cliente INT;
BEGIN
    SELECT u.identificador INTO v_cliente FROM usuarios u WHERE u.email = p_email;
    IF NOT FOUND THEN RAISE EXCEPTION 'No existe el usuario %', p_email; END IF;
    UPDATE mediospago SET verificado = 'si' WHERE cliente = v_cliente;
    RAISE NOTICE '✔ Medios de pago del cliente % verificados', p_email;
END;
$$ LANGUAGE plpgsql;


-- ────────────────────────────────────────────────────────────
-- 3) PROPONER CONDICIONES A UNA SOLICITUD DE ÍTEM
--    La empresa, tras inspeccionar el bien, propone valor base, comisión y
--    fecha/hora/lugar. La solicitud queda en 'condiciones_propuestas' a la
--    espera de que el DUEÑO la ACEPTE (o rechace) desde la app.
--    Recién cuando el dueño ACEPTA, el backend crea el producto, copia las fotos
--    y lo publica en la subasta de su categoría (queda disponible para pujar).
--    p_comision_pct = porcentaje de comisión (ej. 15 = 15%).
-- ────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS aprobar_producto(INT, INT, DECIMAL, DECIMAL);

CREATE OR REPLACE FUNCTION proponer_condiciones(
    p_solicitud_id INT,
    p_valor_base   DECIMAL,
    p_comision_pct DECIMAL DEFAULT 15,
    p_fecha        DATE    DEFAULT (CURRENT_DATE + 30),
    p_hora         TIME    DEFAULT TIME '18:00',
    p_lugar        VARCHAR DEFAULT 'Salón de Remates - Av. Alvear 1245, CABA'
)
RETURNS VOID AS $$
DECLARE v_sol solicitudes_items%ROWTYPE;
BEGIN
    SELECT * INTO v_sol FROM solicitudes_items WHERE identificador = p_solicitud_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'No existe la solicitud %', p_solicitud_id; END IF;

    UPDATE solicitudes_items
       SET estado          = 'condiciones_propuestas',
           valor_base      = p_valor_base,
           comision        = p_comision_pct,
           fecha_subasta   = p_fecha,
           hora_subasta    = p_hora,
           lugar_subasta   = p_lugar,
           direccion_envio = COALESCE(direccion_envio, 'Av. Corrientes 1234, CABA')
     WHERE identificador = p_solicitud_id;

    RAISE NOTICE '✔ Condiciones propuestas para la solicitud %. Ahora el DUEÑO debe ACEPTARLAS en la app (Perfil → Subastar mi artículo). Al aceptar, el producto se publica y queda para pujar.', p_solicitud_id;
END;
$$ LANGUAGE plpgsql;


-- ────────────────────────────────────────────────────────────
-- 4) CERRAR LA SUBASTA DE UN ÍTEM Y ADJUDICAR AL GANADOR
--    Marca la puja más alta como ganadora, marca el ítem como subastado,
--    calcula comisión (% del ítem) y costo de envío (5%) y registra la venta.
--    El bien queda pendiente de pago en "Mis compras" del ganador.
--    Devuelve el id del registro de venta.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cerrar_subasta_item(p_item INT)
RETURNS INT AS $$
DECLARE
    v_ic       itemscatalogo%ROWTYPE;
    v_pujo     pujos%ROWTYPE;
    v_buyer    INT;
    v_duenio   INT;
    v_subasta  INT;
    v_importe  DECIMAL(18,2);
    v_comision DECIMAL(18,2);
    v_envio    DECIMAL(18,2);
    v_registro INT;
BEGIN
    SELECT * INTO v_ic FROM itemscatalogo WHERE identificador = p_item;
    IF NOT FOUND THEN RAISE EXCEPTION 'No existe el ítem de catálogo %', p_item; END IF;
    IF v_ic.subastado = 'si' THEN RAISE EXCEPTION 'El ítem % ya fue subastado', p_item; END IF;

    SELECT * INTO v_pujo FROM pujos
     WHERE item = p_item
     ORDER BY importe DESC, identificador ASC
     LIMIT 1;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Nadie pujó por el ítem %. (Segun el documento, la empresa lo compra al valor base.)', p_item;
    END IF;

    SELECT cliente INTO v_buyer FROM asistentes WHERE identificador = v_pujo.asistente;
    SELECT duenio  INTO v_duenio FROM productos  WHERE identificador = v_ic.producto;
    SELECT subasta INTO v_subasta FROM catalogos WHERE identificador = v_ic.catalogo;

    v_importe  := v_pujo.importe;
    v_comision := ROUND(v_importe * (v_ic.comision / 100.0), 2);
    v_envio    := ROUND(v_importe * 0.05, 2);

    UPDATE pujos        SET ganador   = 'si' WHERE identificador = v_pujo.identificador;
    UPDATE itemscatalogo SET subastado = 'si' WHERE identificador = p_item;

    INSERT INTO registrodesubasta (subasta, duenio, producto, cliente, importe, comision, costo_envio, estado_pago)
    VALUES (v_subasta, v_duenio, v_ic.producto, v_buyer, v_importe, v_comision, v_envio, 'pendiente')
    RETURNING identificador INTO v_registro;

    RAISE NOTICE '✔ Subasta cerrada. Ganador cliente=%, pujado=%, comision=%, envio=%, total=%, registro=%',
        v_buyer, v_importe, v_comision, v_envio, (v_importe + v_comision + v_envio), v_registro;
    RETURN v_registro;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- EJEMPLOS DE USO (descomentar y ajustar los IDs/emails)
-- ============================================================
-- Ver solicitudes de registro pendientes:
--   SELECT identificador, nombre, apellido, email, estado FROM preregistraciones WHERE estado='pendiente';
-- Aprobar un registro (devuelve el token):
--   SELECT aprobar_registro('persona@gmail.com', 'comun');
--
-- Ver medios de pago:
--   SELECT identificador, cliente, tipo, entidad, montogarantizado, verificado FROM mediospago;
-- Verificar un medio de pago:
--   SELECT verificar_medio_pago(1);
--   SELECT verificar_medios_de('persona@gmail.com');
--
-- Ver solicitudes de ítems pendientes:
--   SELECT identificador, cliente, descripcion, estado FROM solicitudes_items WHERE estado='pendiente';
-- Proponer condiciones (valor base 10000, comisión 15%). Queda esperando que el dueño acepte en la app:
--   SELECT proponer_condiciones(1, 10000, 15);
--
-- Ver subastas e ítems publicados:
--   SELECT s.identificador subasta, ic.identificador item, p.descripcioncatalogo, ic.preciobase, ic.subastado
--     FROM subastas s JOIN catalogos c ON c.subasta=s.identificador
--     JOIN itemscatalogo ic ON ic.catalogo=c.identificador
--     JOIN productos p ON p.identificador=ic.producto;
-- Cerrar la subasta de un ítem y adjudicar ganador:
--   SELECT cerrar_subasta_item(1);
