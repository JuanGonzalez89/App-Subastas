# Sistema de Subastas — App Subastas

Aplicación móvil de subastas con backend en Spring Boot y frontend en React Native (Expo).

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Java 21, Spring Boot 3.3.0, Maven |
| Frontend | React Native 0.81, Expo SDK 54, TypeScript |
| Base de datos | PostgreSQL 16+ |
| Autenticación | JWT (HS256) + BCrypt |
| Email | SMTP (Gmail / Ethereal) |

## Requisitos previos

| Herramienta | Versión |
|---|---|
| Java JDK | 21+ |
| PostgreSQL | 16+ |
| Node.js | 18+ |
| npm | 9+ |
| Expo CLI | `npx expo` (incluido) |

## Configuración paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/JuanGonzalez89/App-Subastas.git
cd App-Subastas
```

### 2. Base de datos

```bash
# Conectar como usuario postgres
psql -U postgres

# Crear la base de datos
CREATE DATABASE subastas;

# Conectarse a la nueva base
\c subastas

# Ejecutar el script de inicialización (ajustar la ruta según corresponda)
\i database/init_completo.sql
```

O desde pgAdmin: crear la base de datos `subastas` y ejecutar el contenido de `database/init_completo.sql`.

### 3. Backend (Spring Boot)

```bash
cd backend
```

#### Configurar credenciales

Copiar el archivo de ejemplo y renombrarlo:

```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Editar `application.properties` con los valores correspondientes:

| Propiedad | Descripción | Ejemplo |
|---|---|---|
| `spring.datasource.username` | Usuario de PostgreSQL | `postgres` |
| `spring.datasource.password` | Contraseña de PostgreSQL | `mi_password` |
| `jwt.secret` | Clave secreta JWT (mín. 32 caracteres) | `clave_secreta_muy_larga_y_aleatoria_12345` |
| `spring.mail.username` | Email SMTP (opcional en desarrollo) | `tu_email@gmail.com` |
| `spring.mail.password` | App password de Gmail (opcional) | `xxxx xxxx xxxx xxxx` |

> **Nota:** Si no se configura el email, los tokens de confirmación se muestran en la consola del backend, lo cual es suficiente para desarrollo.

#### Compilar y ejecutar

```bash
# Con Maven wrapper (no requiere Maven instalado)
.\mvnw.cmd clean package -DskipTests

# Iniciar el servidor
.\mvnw.cmd spring-boot:run
```

El backend arranca en `http://localhost:8080`.

### 4. Frontend (React Native / Expo)

```bash
cd frontend
```

#### Configurar variable de entorno

```bash
cp .env.example .env
```

Editar `.env` y definir la URL del backend:

```env
# Para emulador Android (10.0.2.2 apunta a localhost del host)
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080

# Para dispositivo físico, usar la IP local de tu PC
# EXPO_PUBLIC_API_URL=http://192.168.1.100:8080
```

#### Instalar dependencias e iniciar

```bash
npm install
npx expo start
```

Escanear el QR con Expo Go o presionar `a` para Android emulator / `i` para iOS simulator.

## Variables de entorno

### Backend (`backend/src/main/resources/application.properties`)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `spring.datasource.url` | Sí | JDBC URL de PostgreSQL |
| `spring.datasource.username` | Sí | Usuario de BD |
| `spring.datasource.password` | Sí | Contraseña de BD |
| `jwt.secret` | Sí | Clave secreta JWT (mín. 32 caracteres) |
| `jwt.expiration` | No | Expiración JWT en ms (default: 86400000) |
| `spring.mail.host` | No* | Host SMTP |
| `spring.mail.port` | No* | Puerto SMTP |
| `spring.mail.username` | No* | Usuario SMTP |
| `spring.mail.password` | No* | Contraseña SMTP |
| `app.url` | No | URL base de la app |
| `server.port` | No | Puerto del servidor (default: 8080) |

\* No obligatorio en desarrollo; los tokens se ven en la consola.

### Frontend (`frontend/.env`)

| Variable | Obligatoria | Descripción | Ejemplo |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | Sí | URL base del backend | `http://10.0.2.2:8080` |

## Estructura del proyecto

```
App-Subastas/
├── backend/                          # API REST (Spring Boot)
│   ├── src/main/
│   │   ├── java/com/grupo4/subastas/
│   │   │   ├── config/               # CORS, Security, JWT
│   │   │   ├── controller/           # Endpoints REST
│   │   │   ├── dto/                  # Request/Response DTOs
│   │   │   ├── exception/            # Manejo de errores
│   │   │   ├── model/                # Entidades JPA y enums
│   │   │   ├── repository/           # Repositorios JPA
│   │   │   ├── service/              # Lógica de negocio
│   │   │   └── util/                 # JWT utils
│   │   └── resources/
│   │       ├── application.properties.example
│   │       └── application.properties (gitignored)
│   ├── mvnw.cmd
│   └── pom.xml
├── frontend/                         # App móvil (React Native / Expo)
│   ├── src/
│   │   ├── api/                      # Axios instances y API calls
│   │   ├── components/               # Componentes reutilizables
│   │   ├── context/                  # AuthContext
│   │   ├── navigation/               # React Navigation (stacks, tabs)
│   │   ├── screens/                  # Pantallas de la app
│   │   ├── theme/                    # Colores y tipografía
│   │   └── types/                    # Interfaces TypeScript
│   ├── App.tsx
│   ├── .env.example
│   └── .env (gitignored)
├── database/                         # Scripts SQL
│   ├── init_completo.sql             # Script único recomendado
│   ├── schema_profesor_postgres.sql
│   └── migration_sprint*.sql
└── README.md
```

## Comandos útiles

```bash
# Backend — compilar
cd backend && .\mvnw.cmd clean package -DskipTests

# Backend — ejecutar
cd backend && .\mvnw.cmd spring-boot:run

# Frontend — instalar dependencias
cd frontend && npm install

# Frontend — iniciar Expo
cd frontend && npx expo start

# Frontend — iniciar en Android
cd frontend && npx expo start --android
```

## Licencia

Proyecto académico — Grupo 4.
