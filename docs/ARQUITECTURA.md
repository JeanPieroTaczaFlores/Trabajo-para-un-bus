# Arquitectura

## 1. Stack tecnológico

- **Frontend**: HTML5, CSS3 y JavaScript (ES5/ES6, sin frameworks ni transpilación).
- **Backend**: Node.js + Express 4. API REST propia, sin librerías externas más allá de:
  - `mysql2` — conexión a MySQL/MariaDB con *pool* y consultas preparadas.
  - `bcryptjs` — hash de contraseñas.
  - `jsonwebtoken` + `cookie-parser` — sesión con JWT en cookie httpOnly.
  - `express-validator` — validación de entradas.
  - `dotenv` — variables de entorno.
- **Base de datos**: MySQL 8 / MariaDB 10.4+ (el MySQL de XAMPP), administrable desde MySQL Workbench.
- **Persistencia**: los datos viven en MySQL (`andesbus`). No se usa `localStorage` para datos de negocio (solo para preferencias de idioma/accesibilidad y caché ligera de sesión).
- **Idiomas**: español (es) e inglés (en) mediante un diccionario propio en `js/core/i18n.js`.

## 2. Estructura de archivos

```
backend/                          # API REST + MySQL
├── server.js                     # Express, cookies, estático y manejo de errores
├── config/db.js                  # Pool MySQL (variables de entorno)
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
    ├── schema.sql                # BD andesbus (11 tablas)
    ├── seed.sql                  # Datos iniciales de demostración
    └── run.js                    # Ejecuta schema + seed (npm run db:reset)

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

Prefijo: `/api`. El servidor sirve también el frontend estático en el mismo puerto, por lo que no hay CORS. Formato de respuesta: `{ ... }` para éxito y `{ error: { mensaje, codigo? } }` para errores (400/401/403/404/500).

| Módulo | Endpoints | Acceso |
|---|---|---|
| Health | `GET /health` | público |
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

## 4. Autenticación y permisos

- El login devuelve un **JWT en cookie httpOnly** (`sameSite=lax`); el frontend nunca manipula el token (ver `frontend/js/core/api.js`, que envía `credentials: 'same-origin'`).
- Middleware `autenticar` (global): si existe cookie válida, carga `req.usuario`.
- `requireAuth`: exige sesión. `authorize('admin')`: exige rol. `requirePermisos('codigo')`: exige permiso en `rol_permisos`.
- Catálogo de permisos en `permisos`: `clients.view`, `clients.update`, `viajes.manage`, `vehiculos.manage`, `pagos.confirmar`, `bitacora.view`, `reports.view`, entre otros. El rol `admin` siempre tiene acceso total.
- Auditoría: operaciones sensibles registran `logs_actividad` (usuario, acción, módulo, detalle, resultado, IP).

## 5. Modelo de datos (MySQL, BD `andesbus`)

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

### Estados

- **Reserva**: `Confirmada` · `Pendiente de confirmación` (efectivo sin verificar) · `Liberado` (cancelada; ya no ocupa asiento).
- **Vehículo**: `En terminal` · `En ruta` · `Llegado` · `En mantenimiento`.

### Reglas de negocio clave

- Piso 1 (asientos 1–20): `precio base × 1.5`; Piso 2 (21–64): precio base.
- Plan familiar: −10 % al reservar 6 o más asientos.
- Efectivo → `Pendiente de confirmación`; los demás métodos se confirman al instante.
- Un asiento está ocupado si existe una reserva del mismo viaje+fecha con estado ≠ `Liberado` (validado con `SELECT ... FOR UPDATE` dentro de una transacción).
- Cada bus tiene una `sede`; solo toma rutas cuyo origen coincida con su sede. Al marcar llegada, su sede pasa al destino. Los traslados entre sedes se registran en la bitácora.

## 6. Seguridad

- Contraseñas con hash bcrypt (nunca en texto plano).
- Sesión con JWT en cookie httpOnly (no accesible desde JS) + `sameSite`.
- Validación de entrada con `express-validator` y consultas preparadas (SQL injection mitigado).
- Protección de endpoints por rol y permiso; el cliente no decide su propio rol.
- Sin secretos en el repositorio: configuración vía `backend/.env` (ver `backend/.env.example`).
