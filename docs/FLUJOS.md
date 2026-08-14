# Flujos de negocio

Reglas de negocio implementadas en la plataforma. La lógica se valida y ejecuta en el **backend** (controladores); el frontend solo consume la API.

## 1. Registro e inicio de sesión

- `POST /api/auth/register` crea cuentas de **cliente**. El rol es asignado por el servidor (`cliente`), nunca lo elige el usuario. Los correos `@personal.pe` están reservados al personal y el registro de clientes los rechaza.
- `POST /api/auth/login` valida credenciales (correo + bcrypt) y emite un **JWT en cookie httpOnly**. Si la cuenta está desactivada (`activo = 0`), no puede iniciar sesión.
- `GET /api/auth/me` devuelve el usuario de la cookie; el frontend lo usa para `verificarSesion()` y para redirigir por rol (cliente → cuenta, personal → panel personal, admin → panel admin).
- `POST /api/auth/logout` invalida la sesión y borra la cookie.

## 2. Reserva de asientos

El cliente entra desde **Rutas y Horarios** (`pages/cliente/rutas.html`) y pulsa *Reservar*, que lleva a `pages/cliente/reservas.html?viaje=<id>`.

1. `GET /api/viajes/:id?fecha=YYYY-MM-DD` devuelve el viaje y los asientos ocupados para esa fecha.
2. El cliente elige fecha (al menos un día posterior a hoy), asientos y método de pago.
3. `POST /api/reservas` valida en el servidor:
   - El viaje existe y está activo.
   - Los asientos están entre 1 y 64.
   - Los asientos están libres para ese viaje+fecha (consulta `SELECT ... FOR UPDATE` en transacción → evita dobles reservas).
   - Calcula el total: precio por piso (`Piso 1 = base × 1.5`, Piso 2 = base) y, con 6+ asientos, aplica el plan familiar (−10 %).
4. **Efectivo** → estado `Pendiente de confirmación` (debe confirmarse en el terminal en 6 horas). **Tarjeta/Yape/Transferencia** → estado `Confirmada`.
5. Se insertan `reservas`, `reserva_asientos` (1 por asiento) y `pagos` (confirmado o pendiente) y se audita.
6. El cliente consulta sus reservas en `GET /api/reservas/mias` y puede cancelarlas (`DELETE /api/reservas/:id` → pasa a `Liberado` y libera sus asientos).

## 3. Confirmación de pagos en efectivo

- `GET /api/pagos/pendientes` lista las reservas *Pendientes de confirmación*.
- `PUT /api/pagos/:id/confirmar` confirma el pago (la reserva pasa a `Confirmada`). Solo se permite **antes de la salida** del vehículo asignado al viaje.
- El panel personal ofrece la confirmación desde **Clientes**, desde la lista **Pasajeros a bordo** y desde la **ficha del asiento** en el mapa del bus.
- Al **marcar salida** de un vehículo, si hay pagos pendientes para el viaje asignado, el sistema avisa y pide confirmación antes de permitir la salida.

## 4. Control de vehículos

Estados y transiciones válidas:

```
En terminal ──Marcar salida──▶ En ruta ──Marcar llegada──▶ Llegado
     ▲                            │
     │                            └─ (viaje o mantenimiento)
     └────────── Volver al terminal ◀── En mantenimiento
```

- La **asignación de viaje, fecha, conductor y azafata** solo puede modificarse *En terminal*.
- **Regla de sedes**: un bus solo puede tomar rutas cuyo **origen coincida con su sede**. El selector de viaje filtra por ella y el backend lo valida.
- **Llegada**: el bus queda *Llegado* y su `sede` se actualiza al **destino** de la ruta.
- **Traslados**: un bus *En terminal* puede trasladarse a otra sede; si tenía un viaje asignado que no sale de la nueva sede, se le desasigna. Cada traslado se anota en la bitácora.
- **Pasajeros a bordo**: se listan desde las reservas del viaje+fecha asignados al vehículo, agrupados por piso.
- `POST /api/vehiculos` registra vehículos nuevos (placa y tipo).

## 5. Viajes creados por el personal

- `POST /api/viajes-personal` crea viajes adicionales al catálogo fijo; aparecen en **Rutas y Horarios** y pueden reservarse como cualquier otro.
- El panel los etiqueta como *Creado por personal* y permite eliminarlos (`DELETE`).

## 6. Bitácora

- **Recorrido**: se registra al marcar salida (estado `En ruta`) y se completa con la hora de llegada al marcar llegada (`Completado`).
- **Traslado**: se registra al mover un bus entre sedes (`origen → destino`).
- `GET /api/bitacora` devuelve los últimos 500 registros ordenados por fecha (el panel los agrupa por día).

## 7. Administración

- `GET /api/admin/stats`: indicadores del dashboard (clientes, personal, admins, reservas, pagos pendientes, vehículos, viajes, ingresos, reservas de los últimos 7 días, métodos de pago y actividad reciente).
- Usuarios: `GET/POST /api/admin/usuarios`, `PUT/DELETE /api/admin/usuarios/:id` (crear, editar rol/estado, desactivar). Protecciones: no se puede desactivar al único administrador ni la propia cuenta.
- Permisos: `GET/PUT /api/admin/permisos/:id` permite otorgar/revocar permisos por rol. El rol `admin` es fijo (acceso total).
- Auditoría: `GET /api/admin/logs` filtra `logs_actividad` por módulo.

## 8. Roles y permisos

| Rol | Acceso |
|---|---|
| `cliente` | Reservar, ver/cancelar sus reservas, editar su perfil. |
| `personal` | Según permisos asignados: ver clientes y reservas (`clients.view`), gestionar viajes (`viajes.manage`), vehículos/equipo (`vehiculos.manage`), confirmar pagos (`pagos.confirmar`), ver bitácora (`bitacora.view`). |
| `admin` | Todo: estadísticas, usuarios, permisos y logs. |
