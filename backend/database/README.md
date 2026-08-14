# Base de datos de Andesbus (MySQL / MariaDB)

Esquema y datos iniciales de la plataforma. Compatible con **MySQL 8** y
**MariaDB 10.4+** (por ejemplo, el MySQL que incluye XAMPP) y administrable
desde **MySQL Workbench 8.0**.

## Archivos

| Archivo | Contenido |
|---|---|
| `schema.sql` | Creación de la base de datos `andesbus`, las 11 tablas, claves primarias, foráneas, índices y restricciones. |
| `seed.sql` | Datos iniciales: permisos por rol, administrador, personal, clientes, viajes, equipo, vehículos, reservas, pagos, bitácora y logs de ejemplo. |
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

## Usuarios de prueba (solo desarrollo)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@demo.com` | `admin123` |
| Personal | `carlos@personal.pe` | `andes123` |
| Personal | `maria@personal.pe` | `andes123` |
| Cliente | `luis.mendoza@gmail.com` | `cliente123` |

## Cómo crear la base de datos

### Opción A: desde la línea de comandos

```bash
cd backend
mysql -u root -p < database/schema.sql
mysql -u root -p andesbus < database/seed.sql
```

### Opción B: con el script npm (usa `.env`)

```bash
cd backend
npm install
npm run db:reset   # recrea la base y carga schema + seed
```

### Opción C: desde MySQL Workbench

1. Abre `backend/database/schema.sql` en Workbench y ejecútalo (⏵).
2. Abre `backend/database/seed.sql` y ejecútalo.
3. Verifica con `SELECT * FROM andesbus.usuarios;`.
