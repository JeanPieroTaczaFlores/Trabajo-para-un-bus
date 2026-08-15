# Arquitectura

## 1. Stack tecnológico

- **Frontend**: HTML5, CSS3 y JavaScript (ES5/ES6, sin frameworks ni transpilación).
- **Backend**: Node.js + Express 4. API REST propia, sin librerías externas más allá de:
  - `pg` — cliente PostgreSQL con *pool* de conexiones y consultas preparadas.
  - `bcryptjs` — hash de contraseñas.
  - `jsonwebtoken` + `cookie-parser` — sesión con JWT en cookie httpOnly.
  - `express-validator` — validación de entradas.
  - `dotenv` — variables de entorno.
- **Base de datos**: PostgreSQL 15+ (en producción se usa **Supabase**, que gestiona la instancia). El esquema usa `SERIAL`, restricciones `CHECK` (en lugar de `ENUM`), claves foráneas y un trigger para `actualizado_en`.
- **Hosting / despliegue**: **Vercel**. Toda la app se publica como una única función serverless (`api/index.js` que exporta la app Express); la misma URL sirve la API (`/api/*`) y el frontend estático.
- **Persistencia**: los datos viven en PostgreSQL (base `postgres`, esquema `public`). No se usa `localStorage` para datos de negocio (solo para preferencias de idioma/accesibilidad y caché ligera de sesión).
- **Idiomas**: español (es) e inglés (en) mediante un diccionario propio en `js/core/i18n.js`.

## 2. Estructura de archivos

```
backend/                          # API REST + PostgreSQL
├── app.js                        # App Express (exportada para Vercel)
│                                 #   JSON, cookies, /api, estático, errores
├── server.js                     # Arranque local: app.listen(PORT)
├── config/db.js                  # Pool PostgreSQL + capa de compatibilidad
│                                 #   (convierte '?' -> $1..$n, IN (?) con arrays,
│                                 #   insertId vía RETURNING id, transacciones)
├── controllers/                  # auth, perfil, viajes, reservas, clientes, equipo,
│                                 # vehiculos, viajesPersonal, pagos, bitacora, admin
├── middleware/
│   ├── auth.js                   # requireAuth (JWT/cookie), authorize(rol), requirePermisos(código)
│   ├── validate.js               # Resultado de express-validator
│   └── error.js                  # Manejador central de errores (JSON)
├── routes/                       # Un archivo de rutas por módulo
├── utils/
│   ├── asyncHandler.js           # Envuelve controladores async
│   ├── auditor.js                # auditar() -> logs_actividad
│   └── httpError.js              # badRequest / notFound / forbidden / unauthorized
└── database/
    ├── schema.sql                # Esquema PostgreSQL (11 tablas)
    ├── seed.sql                  # Datos iniciales de demostración
    └── run.js                    # Ejecuta schema + seed (npm run db:reset)

api/index.js                      # Función serverless de Vercel: module.exports = app
vercel.json                       # Rewrite de todas las rutas a /api/index
package.json                      # Dependencias de producción (usa Vercel)

frontend/
├── index.html, css/style.css, assets/logo.svg
├── pages/
│   ├── publica/                  # nosotros, contacto
│   ├── cliente/                  # rutas, reservas, login, registro, cuenta
│   ├── personal/                 # personal.html
│   └── administrador/            # admin.html
└── js/
    ├── core/
    │   ├── api.js                # Cliente HTTP (fetch + cookie), toasts y helpers UI
    │   ├── auth.js               # Sesión: verificar, cerrar, rutas por rol
    │   ├── i18n.js               # Diccionario ES/EN y t()
    │   └── main.js               # Menú móvil, navbar según sesión, accesibilidad
    ├── cliente/                  # rutas, reservas, login, registro, cuenta
    ├── personal/                 # Panel del personal (secciones via API)
    └── administrador/            # Panel de administración (secciones via API)
```

## 3. API REST

Prefijo: `/api`. El servidor sirve también el frontend estático en el mismo dominio (local y en Vercel), por lo que no hay CORS. Formato de respuesta: `{ ... }` para éxito y `{ error: { mensaje, codigo? } }` para errores (400/401/403/404/500).

| Módulo | Endpoints | Acceso |
|---|---|---|
| Health | `GET /api/health` | público |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | público / sesión |
| Perfil | `GET/PUT /api/perfil` | sesión |
| Viajes | `GET /api/viajes`, `GET /api/viajes/:id?fecha=` | público |
| Reservas | `GET /api/reservas/mias`, `POST /api/reservas`, `DELETE /api/reservas/:id`, `GET /api/reservas/todas` | sesión (todas: permiso `clients.view`) |
| Clientes | `GET /api/clientes` (+ sus reservas) | permiso `clients.view` |
| Equipo | `GET/POST /api/equipo` | permiso `vehiculos.manage` |
| Vehículos | `GET/PUT /api/vehiculos/:id` (estado, viaje, tripulación, traslado), `POST /api/vehiculos` | permiso `vehiculos.manage` |
| Viajes personal | `GET/POST/DELETE /api/viajes-personal` | permiso `viajes.manage` |
| Pagos | `GET /api/pagos/pendientes`, `PUT /api/pagos/:id/confirmar` | permiso `pagos.confirmar` |
| Bitácora | `GET /api/bitacora` | permiso `bitacora.view` |
| Admin | `GET /api/admin/stats`, `GET/POST /api/admin/usuarios`, `PUT/DELETE /api/admin/usuarios/:id`, `GET/PUT /api/admin/permisos(/:id)`, `GET /api/admin/logs` | rol `admin` |

## 4. Capa de acceso a datos (`config/db.js`)

Para no reescribir la lógica de negocio al migrar de MySQL a PostgreSQL, `db.js` expone la **misma firma que mysql2/promise** sobre el driver `pg`:

- `pool.query(sql, params)` → devuelve `[filas]` en los `SELECT` y `[header]` (`insertId`, `affectedRows`, `changedRows`) en INSERT/UPDATE/DELETE.
- Los placeholders `?` se convierten a `$1, $2, ...`; un parámetro tipo array se expande para emular `IN (?)` de MySQL.
- A los `INSERT` sin `RETURNING` se les agrega `RETURNING id` para obtener `insertId`.
- `pool.getConnection()` devuelve un cliente con `query`, `beginTransaction()`, `commit()`, `rollback()` y `release()`.
- Tipos: `DATE`, `TIMESTAMP`/`TIMESTAMPTZ` e `INT8` se parsean a los mismos formatos que devolvía mysql2 (`'YYYY-MM-DD'`, `'YYYY-MM-DD HH:MM:SS'`, números).

## 5. Autenticación y permisos

- El login devuelve un **JWT en cookie httpOnly** (`sameSite=lax`; `secure` en producción); el frontend nunca manipula el token (ver `frontend/js/core/api.js`, que envía `credentials: 'same-origin'`).
- Middleware `autenticar` (global): si existe cookie válida, carga `req.usuario`.
- `requireAuth`: exige sesión. `authorize('admin')`: exige rol. `requirePermisos('codigo')`: exige permiso en `rol_permisos`.
- Catálogo de permisos en `permisos`: `clients.view`, `clients.update`, `viajes.manage`, `vehiculos.manage`, `pagos.confirmar`, `bitacora.view`, `reports.view`, entre otros. El rol `admin` siempre tiene acceso total.
- Auditoría: operaciones sensibles registran `logs_actividad` (usuario, acción, módulo, detalle, resultado, IP).

## 6. Modelo de datos (PostgreSQL, esquema `public`)

| Tabla | Contenido |
|---|---|
| `usuarios` | Cuentas con rol `cliente` / `personal` / `admin` y `contrasena_hash` (bcrypt). |
| `permisos`, `rol_permisos` | Permisos granulares y asignación por rol. |
| `viajes` | Catálogo de rutas (y viajes creados por personal). |
| `equipo` | Conductores y azafatas. |
| `vehiculos` | Flota con estado, sede, viaje y tripulación asignada. |
| `reservas` | Reservas por viaje y fecha (pasajeros, total, método, estado, plan familiar). |
| `reserva_asientos` | Asientos de cada reserva (1 fila por asiento, normalizado). |
| `pagos` | Pago por reserva (el efectivo requiere confirmación del personal). |
| `bitacora` | Recorridos y traslados de la flota. |
| `logs_actividad` | Auditoría de operaciones. |

> Detalles de implementación PostgreSQL: columnas `SERIAL` para IDs, `TEXT` + `CHECK (...)` para los campos tipo enumerado, `SMALLINT` con `CHECK` para los booleanos, trigger `andesbus_set_actualizado_en` que rellena `actualizado_en` en cada UPDATE, y un bloque `setval(...)` al final del seed para sincronizar las secuencias.

### Estados

- **Reserva**: `Confirmada` · `Pendiente de confirmación` (efectivo sin verificar) · `Liberado` (cancelada; ya no ocupa asiento).
- **Vehículo**: `En terminal` · `En ruta` · `Llegado` · `En mantenimiento`.

### Reglas de negocio clave

- Piso 1 (asientos 1–20): `precio base × 1.5`; Piso 2 (21–64): precio base.
- Plan familiar: −10 % al reservar 6 o más asientos.
- Efectivo → `Pendiente de confirmación`; los demás métodos se confirman al instante.
- Un asiento está ocupado si existe una reserva del mismo viaje+fecha con estado ≠ `Liberado` (validado con `SELECT ... FOR UPDATE` dentro de una transacción).
- Cada bus tiene una `sede`; solo toma rutas cuyo origen coincida con su sede. Al marcar llegada, su sede pasa al destino. Los traslados entre sedes se registran en la bitácora.

## 7. Seguridad

- Contraseñas con hash bcrypt (nunca en texto plano).
- Sesión con JWT en cookie httpOnly (no accesible desde JS) + `sameSite` (+ `secure` en HTTPS).
- Validación de entrada con `express-validator` y consultas preparadas (SQL injection mitigado).
- Protección de endpoints por rol y permiso; el cliente no decide su propio rol.
- Sin secretos en el repositorio: configuración vía variables de entorno (`backend/.env` localmente, variables de entorno en Vercel). Ver `backend/.env.example`.
- En producción (Vercel) la conexión a Supabase exige SSL (`PGSSL=true`).

## 8. Despliegue

- **Vercel** usa `package.json` de la raíz (dependencias `express`, `pg`, etc.), detecta `api/index.js` y reescribe todas las rutas hacia él (`vercel.json`).
- Variables de entorno en Vercel: `DATABASE_URL`, `PGSSL=true`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_NAME`, `APP_BASE_URL`.
- Guía completa: [DESPLIEGUE.md](DESPLIEGUE.md).
