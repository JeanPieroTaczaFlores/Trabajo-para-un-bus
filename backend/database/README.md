# Base de datos de Andesbus (PostgreSQL / Supabase)

Esquema y datos iniciales de la plataforma. Compatible con **PostgreSQL 15+**.
En producción la base es gestionada por **Supabase**; en desarrollo puedes usar
cualquier PostgreSQL local (p. ej. el instalado con Postgres.app, el paquete de
tu distro, Docker, o una instancia en la nube).

## Archivos

| Archivo | Contenido |
|---|---|
| `schema.sql` | Creación de las 11 tablas, claves primarias, foráneas, índices, restricciones `CHECK` y el trigger de `actualizado_en`. |
| `seed.sql` | Datos iniciales: permisos por rol, administrador, personal, clientes, viajes, equipo, vehículos, reservas, pagos, bitácora y logs de ejemplo. Incluye un bloque `setval` para sincronizar las secuencias `SERIAL`. |
| `run.js` | Script Node que ejecuta `schema.sql` y `seed.sql` usando las variables de entorno. `npm run db:reset` lo invoca. |

## Tablas

- `usuarios` — cuentas con rol `cliente` / `personal` / `admin` (contraseñas con hash bcrypt).
- `permisos` + `rol_permisos` — catálogo de permisos granulares y asignación por rol.
- `viajes` — catálogo de rutas (y viajes creados por personal).
- `equipo` — conductores y azafatas.
- `vehiculos` — flota con estado, sede, viaje y tripulación asignada.
- `reservas` — reservas de pasajeros por viaje y fecha.
- `reserva_asientos` — asientos de cada reserva (normalizado, 1 fila por asiento).
- `pagos` — pago por reserva (el efectivo requiere confirmación del personal).
- `bitacora` — recorridos y traslados de la flota.
- `logs_actividad` — auditoría de operaciones (usuario, acción, módulo, resultado, IP).

## Usuarios de prueba (solo desarrollo/demo)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@demo.com` | `admin123` |
| Personal | `carlos@personal.pe` | `andes123` |
| Personal | `maria@personal.pe` | `andes123` |
| Cliente | `luis.mendoza@gmail.com` | `cliente123` |

## Cómo crear la base de datos

### Opción A: producción en Supabase (SQL Editor)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Menú lateral → **SQL Editor** → **New query**.
3. Pega el contenido de `schema.sql` → **Run**.
4. Nueva query con el contenido de `seed.sql` → **Run**.
5. Verifica en **Table Editor** que las tablas existen con datos.

### Opción B: con el script npm (usa `.env`)

```bash
cd backend
npm install
npm run db:reset   # recrea el esquema y carga schema + seed
```

`run.js` lee `DATABASE_URL` (o `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`) desde `backend/.env`.

### Opción C: con un cliente SQL (psql, DBeaver, pgAdmin)

```bash
psql "postgresql://postgres:clave@localhost:5432/andesbus" -f backend/database/schema.sql
psql "postgresql://postgres:clave@localhost:5432/andesbus" -f backend/database/seed.sql
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión completa (`postgresql://usuario:clave@host:puerto/bd`). En Supabase, para Vercel se usa el **transaction pooler** (puerto `6543`). |
| `PGSSL` | `true` en producción (Supabase exige SSL). |
| `DATABASE_HOST/PORT/USER/PASSWORD/NAME` | Alternativa a `DATABASE_URL` para conexión por partes (solo local). |
