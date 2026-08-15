# Guía de uso

Guía rápida. Para el manual completo (paso a paso por rol) ver [MANUAL_DE_USUARIO.md](MANUAL_DE_USUARIO.md). Para publicar el proyecto, ver [DESPLIEGUE.md](DESPLIEGUE.md).

## 1. Puesta en marcha (desarrollo local)

Requisitos: **Node.js 18+** y una base **PostgreSQL** (local o un proyecto en [Supabase](https://supabase.com)).

```bash
cd backend
npm install
npm run db:reset     # crea el esquema y carga los datos de demostración
node server.js       # levanta API + frontend en http://localhost:3001
```

Antes de `db:reset`, copia `backend/.env.example` a `backend/.env` y completa `DATABASE_URL` y `JWT_SECRET`.

## 2. Puesta en marcha (producción)

El proyecto ya está publicado en **Vercel** y usa **Supabase** como base de datos:

- **URL del sitio**: `https://trabajo-para-un-bus.vercel.app`
- **API**: `https://trabajo-para-un-bus.vercel.app/api/health`
- Cualquier cambio que se suba a la rama `main` de GitHub se despliega automáticamente.

## 3. Credenciales de acceso (demo)

| Rol | Nombre | Correo | Contraseña |
|---|---|---|---|
| Administrador | Admin Andesbus | admin@demo.com | `admin123` |
| Personal | Carlos Ramírez | carlos@personal.pe | `andes123` |
| Personal | María Torres | maria@personal.pe | `andes123` |
| Cliente | Luis Mendoza | luis.mendoza@gmail.com | `cliente123` |

> Los correos `@personal.pe` son exclusivos del personal: el registro público de clientes los rechaza.

## 4. Flujo del cliente

1. **Registro** (`/pages/cliente/registro.html`): nombre completo, correo válido, teléfono (7–9 dígitos) y contraseña (mínimo 6 caracteres).
2. **Inicio de sesión** (`/pages/cliente/login.html`): según el rol, la sesión redirige a la cuenta, al panel personal o al panel de administración.
3. **Rutas y Horarios** (`/pages/cliente/rutas.html`): busca por origen y destino; cada viaje muestra hora de salida, duración y precio.
4. **Reserva** (`/pages/cliente/reservas.html?viaje=<id>`):
   - Fecha del viaje (mínimo un día posterior a hoy).
   - Plano del bus: Piso 1 *premium* (asientos 1–20, ×1.5) y Piso 2 (21–64). Los ocupados aparecen deshabilitados.
   - Método de pago: tarjeta (validación de datos), Yape/Plin, transferencia o efectivo.
   - Con 6 o más asientos se aplica el **plan familiar (−10 %)**.
5. **Mi cuenta** (`/pages/cliente/cuenta.html`): datos personales y historial de reservas con estado y monto. Puedes cancelar una reserva (se liberan tus asientos).

### Reglas para el cliente

- 🎫 Presenta tu **DNI** en ventanilla **30 minutos antes de la salida** para recoger el ticket.
- 💵 **Efectivo**: queda *Pendiente de confirmación*; confírmalo en el terminal dentro de **6 horas** o tus asientos quedarán disponibles.
- 👨‍👩‍👧‍👦 El descuento familiar es del **10 %** con 6 o más pasajeros.

## 5. Panel del personal (`/pages/personal/personal.html`)

Ingresa con una cuenta `@personal.pe` (p. ej. `carlos@personal.pe` / `andes123`). Secciones:

- **📊 Resumen**: clientes, reservas, pagos por confirmar, vehículos en ruta.
- **👥 Clientes**: clientes y sus reservas, con **confirmar pago (efectivo)** para las pendientes.
- **🎫 Reservas**: todas las reservas con datos del cliente (origen, destino, fecha, asientos, total, estado).
- **💵 Pagos**: pagos pendientes de confirmar.
- **📅 Historial**: reservas por año.
- **🚌 Viajes**: catálogo + viajes creados por el personal (se pueden eliminar). **➕ Nuevo viaje** los crea.
- **🚍 Vehículos**: estado (salida/llegada/mantenimiento), asignación de viaje/fecha/chofer/azafata, **traslado de sede**, mapa de asientos con ficha de cada pasajero y confirmación de pagos (solo *En terminal*). Permite registrar vehículos.
- **🧑‍✈️ Conductores y Azafatas**: listado del equipo operativo (edición exclusiva de administración).
- **🧭 Recorridos y traslados**: bitácora diaria de la flota.

## 6. Panel de administración (`/pages/administrador/admin.html`)

Ingresa con `admin@demo.com` / `admin123`. Secciones:

- **📊 Resumen**: estadísticas globales (usuarios por rol, reservas, pagos pendientes, vehículos, viajes, ingresos), reservas de los últimos 7 días, métodos de pago y actividad reciente.
- **👥 Usuarios**: crear usuarios (cualquier rol), buscar/filtrar, editar rol y contraseña, activar/desactivar. No se puede desactivar al único administrador ni a uno mismo.
- **🔐 Permisos**: matriz de permisos por rol (el rol `admin` es fijo con acceso total).
- **📋 Auditoría**: log de operaciones filtrable por módulo.

## 7. Accesibilidad (todas las páginas)

Botón flotante ♿ con opciones persistentes en `localStorage`: tamaño de letra, modo noche, máscara de lectura, alto contraste, espaciado, modo lectura, subrayar enlaces, pausar animaciones, lectura en voz alta e idioma ES/EN. También hay botón flotante de **WhatsApp**.

## 8. ¿Cómo se reinician los datos?

En local: ejecuta `npm run db:reset` en `backend/` para recrear la base con los datos de demostración.

En producción (Supabase): en el **SQL Editor** del proyecto, borra las tablas (o ejecuta los scripts de nuevo) y vuelve a correr `schema.sql` y `seed.sql`. O crea un nuevo proyecto de Supabase y repite el [despliegue](DESPLIEGUE.md).
