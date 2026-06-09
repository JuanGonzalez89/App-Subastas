# App Subastas — Resumen de Cambios

## Progreso General

> **Estado:** 6 fases completadas + parches posteriores  
> **Backend:** Java 21, Spring Boot 3.3.0, Maven  
> **Frontend:** React Native 0.81, Expo SDK 54, TypeScript  
> **BD:** PostgreSQL 16+

---

## FASE 1 — Seguridad (3 archivos)

| Archivo | Cambio |
|---------|--------|
| `SecurityConfig.java` | Endpoint `/auth/admin/**` requiere rol ADMIN; `/auth/registro/**` y `/auth/login` públicos |
| `CorsConfig.java` | Orígenes restringidos: `localhost:*`, `10.0.2.2:*`, `192.168.*:*`, `exp://*` |
| `application.properties` / `.example` | Credenciales movidas a variables de entorno con fallback local |

---

## FASE 2 — BD + JPA (7 archivos)

| Archivo | Cambio |
|---------|--------|
| `init_completo.sql` | Columna `rol` agregada, typo `incativo` → `inactivo`, seed de admin |
| `migration_sprint4.sql` | Columna `fechahora` faltante en `pujos` |
| `migration_sprint5.sql` | Tabla `solicitudes_fotos`, columna `rol`, 11 índices FK |
| `schema_profesor_postgres.sql` | Typo `incativo` → `inactivo` |
| `Persona.java` | Campo `foto byte[]` agregado (existía en BD pero no en JPA) |

---

## FASE 3 — Backend funcional (8 archivos)

| Archivo | Cambio |
|---------|--------|
| `VincularItemCatalogoRequest.java` | `@NotNull` en `precioBase` |
| `CrearProductoRequest.java` | Campo `duenio` (ya no hardcodeado) |
| `AdminService.java` | `toResponse` incluye `fotoIds`, typo `SUBSTADOR` → `SUBASTADOR`, `aprobarSolicitudItem` crea Producto, `crearProducto` usa `duenio` del request |
| `PujaService.java` | Validación: ítem pertenece a subasta, NPE de `precioBase` |
| `AuthService.java` | Login valida `admitido="si"`, `aprobarRegistro` acepta `rol` |
| `AuthController.java` | `aprobarRegistro` recibe `@RequestParam(defaultValue = "USER") String rol` |
| `ClienteService.java` | `subastasGanadas` cuenta subastas distintas (no pujas) |
| `adminApi.ts` | `rol` en `aprobarPreRegistroAdminApi`, `duenio` en `CrearProductoRequest` |

---

## FASE 4 — Frontend funcional (10 archivos)

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | `disenador?` y `origenDilenador?` en `ItemResponse` |
| `SubastasStack.tsx` | `moneda?` en params de `ItemDetail` |
| `AuctionDetailScreen.tsx` | Pasa `moneda` real a `ItemDetail` |
| `ItemDetailScreen.tsx` | Tipos reales en vez de `as any`, pasa moneda real |
| `LiveAuctionScreen.tsx` | Incrementos basados en oferta actual, polling se detiene al ganar |
| `AuctionListScreen.tsx` | `FlatList` → `ScrollView` + `RefreshControl` |
| `AdminScreen.tsx` | `ScrollForm` con `ScrollView`, campo `duenio` |
| `ProfileScreen.tsx` | Gráfico con datos reales del historial |
| `HistorialScreen.tsx` | Guard clause en vez de `historial!` |
| `SubastarItemScreen.tsx` | Validación min/max fotos consistente |
| `AuthContext.tsx` | Try/catch para JSON corrupto en SecureStore |

---

## FASE 5 — Backend code smells (1 archivo)

| Archivo | Cambio |
|---------|--------|
| `SecurityConfig.java` | Inyecta `CorsConfigurationSource` como bean |

---

## FASE 6 — Frontend cleanup (5 archivos)

| Archivo | Cambio |
|---------|--------|
| `authApi.ts` | Import unificado a `api` |
| `subastasApi.ts` | Import unificado a `api` |
| `LoginScreen.tsx` | Pasa email real a `RegisterStep3` |
| `clienteApi.ts` | Header `Content-Type: multipart/form-data` redundante eliminado |
| `app.json` | `extra.apiUrl` muerto eliminado |

---

## Parches posteriores

### Bug 1 — Solicitudes de usuarios en admin

| Archivo | Cambio |
|---------|--------|
| `PreRegistracionResponse.java` | **Nuevo** DTO de respuesta |
| `PreRegistracionRepository.java` | `findAllByEstado(String)` |
| `AdminService.java` | `listarSolicitudesUsuarios()`, campo `preRegistracionRepository` |
| `AdminController.java` | `GET /admin/solicitudes-usuarios` |
| `types/index.ts` | `PreRegistracionResponse` type |
| `adminApi.ts` | `listarSolicitudesUsuariosApi()` |
| `AdminScreen.tsx` | Subtabs: **Usuarios Pendientes** | **Productos Pendientes** |

### Bug 2 — Eliminar subastas (desde BD)

SQL a ejecutar en pgAdmin si se necesita:
```sql
DELETE FROM pujos;
DELETE FROM items_catalogo;
DELETE FROM catalogos;
DELETE FROM asistentes_subasta;
DELETE FROM rds_subastas;
DELETE FROM subastas;
```

### Bug 3 — Modal de método de pago

| Archivo | Cambio |
|---------|--------|
| `PaymentMethodsScreen.tsx` | `flex: 1` en `KeyboardAvoidingView`, `flex: 1` en `modalSheet`, `paddingBottom: 40` → 80 en `modalBody` |

### Admin — Aprobación de medios de pago

| Archivo | Cambio |
|---------|--------|
| `MedioPagoRepository.java` | `findAllByVerificado(String)` |
| `AdminService.java` | `listarMediosPagoPendientes()`, `aprobarMedioPago(id)`, campo `medioPagoRepository` |
| `AdminController.java` | `GET /admin/medios-pago`, `POST /admin/medios-pago/{id}/aprobar` |
| `adminApi.ts` | `listarMediosPagoAdminApi()`, `aprobarMedioPagoAdminApi(id)` |
| `AdminScreen.tsx` | Tercer subtab **"Medios Pendientes"** en Solicitudes, con cards + badge + botón aprobar |

### Bug 4 — Internal Server Error al crear subasta/producto

| Archivo | Cambio |
|---------|--------|
| `CrearSubastaRequest.java` | `@Pattern(regexp = "comun\|especial\|plata\|oro\|platino")` en `categoria` |
| `CrearProductoRequest.java` | `@Size(max = 300)` en `descripcionCompleta` |
| `AdminScreen.tsx` | `maxLength={300}` en input de descripción |

### Email SMTP — Gmail

| Archivo | Cambio |
|---------|--------|
| `application.properties` | App password sin espacios, debug logging de mail |
| `EmailService.java` | `message.setFrom("juanignaciogonzalez.ca@gmail.com")` |

### Pujos — columna `fechahora` faltante

| Archivo | Cambio |
|---------|--------|
| `migration_sprint4.sql` | `ALTER TABLE pujos ADD COLUMN IF NOT EXISTS fechahora TIMESTAMP DEFAULT NOW()` |

### Persona foto — `@Lob` vs `bytea`

| Archivo | Cambio |
|---------|--------|
| `Persona.java` | `@Lob` eliminado del campo `foto` (BD usa `bytea`) |

### SolicitudFoto — mismo error `@Lob` vs `bytea`

| Archivo | Cambio |
|---------|--------|
| `SolicitudFoto.java` | `@Lob` eliminado del campo `foto` (BD usa `bytea`) |

### Flujo solicitar item — fotos en un solo POST multipart

**Problema:** Las fotos se subían primero (POST `/solicitudes-fotos`) sin `solicitud_item_id`, violando NOT NULL.

**Solución:** El endpoint `/clientes/me/solicitudes-items` ahora acepta `multipart/form-data` con los datos + las fotos. Crea la `SolicitudItem` primero y luego las `SolicitudFoto` con el ID.

| Archivo | Cambio |
|---------|--------|
| `SolicitudItemRequest.java` | Eliminado campo `fotoIds` (ya no se usa) |
| `ClienteController.java` | Endpoint cambiado a `@RequestParam` individuales (`descripcion`, `descripcionCompleta`, `precioSugerido`, `fotos MultipartFile[]`) |
| `ClienteService.java` | `solicitarItem` recibe campos sueltos + `MultipartFile[]`, crea fotos inline tras crear la solicitud |
| `clienteApi.ts` | `solicitarItemApi` envía multipart con campos individuales + archivos; `subirFotoSolicitudApi` eliminado |
| `SubastarItemScreen.tsx` | Envía todo en un solo llamado, sin `subirFotoSolicitudApi` |

### Admin aprobar solicitud — `varchar(300)` overflow

| Archivo | Cambio |
|---------|--------|
| `AdminService.java` | `descripcion` y `descripcionCompleta` truncadas a 300 caracteres al crear Producto |

### Admin aprobar solicitud — FK `duenios` faltante

**Problema:** `productos.duenio` referencia `duenios(identificador)`, pero no existía registro de `Duenio` para el cliente.

**Solución:** Nueva entidad `Duenio` + `DuenioRepository`. En `aprobarSolicitudItem` y `crearProducto`, si no existe el `Duenio` se crea automáticamente.

| Archivo | Cambio |
|---------|--------|
| `Duenio.java` | **Nuevo** — entidad JPA para tabla `duenios` |
| `DuenioRepository.java` | **Nuevo** — repositorio JPA |
| `AdminService.java` | Antes de crear Producto, verifica/crea `Duenio` si no existe |

---

## Próximos pasos sugeridos

- [x] Compilar backend y ejecutar migraciones SQL
- [x] Probar login como admin (`admin@subastas.com` / `admin123`)
- [ ] Probar flujo completo: registro → aprobación → login → subastar ítem → pujar
- [ ] Verificar CORS desde Expo Go y emulador Android
- [ ] Revisar dependencias faltantes si hay errores de compilación
- [ ] **Importante:** Ejecutar `migration_sprint5.sql` en BD si no se ejecutó aún (crea `solicitudes_fotos`)

---

*Documento generado automáticamente — actualizado al 08/06/2026*
