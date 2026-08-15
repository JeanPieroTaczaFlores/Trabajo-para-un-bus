# Manual de usuario — Andesbus

Manual detallado para los tres tipos de usuario: **cliente**, **personal** y **administrador**. También incluye las opciones de accesibilidad disponibles en todas las páginas.

**Acceso:** producción en `https://trabajo-para-un-bus.vercel.app` · desarrollo local en `http://localhost:3001`.

---

## 1. Primeros pasos

### 1.1 Requisitos del usuario
- Navegador moderno (Chrome, Edge, Firefox, Safari) con JavaScript habilitado.
- Conexión a internet (para producción).
- Correo electrónico válido y DNI (para reservar; se presenta en ventanilla).

### 1.2 Pantallas principales
| Pantalla | Ruta |
|---|---|
| Inicio | `/` |
| Nosotros | `/pages/publica/nosotros.html` |
| Contacto | `/pages/publica/contacto.html` |
| Rutas y horarios | `/pages/cliente/rutas.html` |
| Reserva de asientos | `/pages/cliente/reservas.html?viaje=<id>` |
| Registro | `/pages/cliente/registro.html` |
| Inicio de sesión | `/pages/cliente/login.html` |
| Mi cuenta | `/pages/cliente/cuenta.html` |
| Panel del personal | `/pages/personal/personal.html` |
| Panel de administración | `/pages/administrador/admin.html` |

---

## 2. Para el cliente

### 2.1 Crear una cuenta
1. Abre la página de **Registro** (enlace "Crear cuenta" del menú).
2. Completa: **nombre completo**, **correo** válido, **teléfono** (7–9 dígitos) y **contraseña** (mínimo 6 caracteres).
3. Pulsa **Registrarse**.
4. Listo: la sesión se inicia automáticamente y te redirige a tu cuenta.

> ⚠️ Los correos que terminan en `@personal.pe` están reservados al personal; el sistema rechazará ese registro.

### 2.2 Iniciar y cerrar sesión
- **Iniciar**: menú → **Iniciar sesión** → correo y contraseña.
- Según tu rol, la sesión te redirige a: **Mi cuenta** (cliente), **Panel del personal** o **Panel de administración**.
- **Cerrar**: botón **Cerrar sesión** en el menú (o en el panel según tu rol).

### 2.3 Buscar un viaje
1. Menú → **Rutas y Horarios**.
2. Selecciona **Origen** y **Destino** de la lista (Lima, Arequipa, Cusco, Trujillo, Puno).
3. Verás los viajes con **hora de salida**, **duración** y **precio**.
4. Pulsa **Reservar** en el viaje que prefieras.

### 2.4 Reservar asientos
1. En la página de reserva elige la **fecha** (debe ser al menos un día posterior a hoy).
2. En el **plano del bus** (dos pisos) toca los asientos libres:
   - **Piso 1 (asientos 1–20)**: *premium*, precio base ×1.5.
   - **Piso 2 (asientos 21–64)**: económico, precio base.
   - Los asientos **ocupados** aparecen deshabilitados y no se pueden seleccionar.
3. Elige el **método de pago**:
   - **Tarjeta**: completa número, titular, mes/año y CVC (validación de datos).
   - **Yape / Plin**: confirma el código.
   - **Transferencia**: confirma el código.
   - **Efectivo**: pagas en la terminal; la reserva queda *Pendiente de confirmación*.
4. Con **6 o más asientos** se aplica automáticamente el **plan familiar (−10 %)**.
5. Revisa el **total** y pulsa **Confirmar reserva**.

### 2.5 Ver y cancelar reservas
1. Menú → **Mi cuenta**.
2. En **historial de reservas** verás cada reserva con origen, destino, fecha, asientos, monto y estado.
3. Para cancelar, pulsa **Cancelar**: la reserva pasa a *Liberado* y tus asientos quedan disponibles para otros pasajeros.

### 2.6 Reglas del pasajero
- 🎫 Presenta tu **DNI** en ventanilla **30 minutos antes de la salida** para recoger tu ticket.
- 💵 Si pagaste en **efectivo**, tu reserva queda *Pendiente de confirmación*: confírmala en la terminal dentro de **6 horas** o tus asientos quedan disponibles.
- 👨‍👩‍👧‍👦 El descuento familiar es del **10 %** con 6 o más pasajeros.
- La cancelación libera los asientos, pero los pagos ya confirmados **no se reembolsan** por esta plataforma (consultar en ventanilla).

---

## 3. Para el personal

El panel del personal se usa con una cuenta `@personal.pe` (demo: `carlos@personal.pe` / `andes123`).

**Ingreso:** menú → **Iniciar sesión** → panel del personal.

### 3.1 Resumen
Muestra indicadores del día: clientes, reservas, **pagos por confirmar** y vehículos en ruta.

### 3.2 Clientes
- Lista de clientes con sus reservas.
- Para una reserva pendiente de pago en efectivo, usa el botón **Confirmar pago** (también disponible desde Pagos y desde el mapa de asientos).

### 3.3 Reservas
- Todas las reservas con datos del cliente: origen, destino, fecha, asientos, total y estado.
- Pestaña **Historial**: reservas filtradas por año.

### 3.4 Pagos
- Lista de pagos **pendientes de confirmar** (efectivo).
- Pulsa **Confirmar** para marcar la reserva como confirmada. Solo se permite **antes de la salida** del bus.

### 3.5 Viajes
- **Catálogo** de viajes fijos + viajes creados por el personal (etiqueta *Creado por personal*).
- **➕ Nuevo viaje**: crea un viaje adicional; aparece en la búsqueda pública y puede reservarse.
- Botón **Eliminar** (solo viajes creados por personal).

### 3.6 Vehículos
Para cada bus de la flota:

- **Cambiar estado**: *En terminal* → **Marcar salida** → *En ruta* → **Marcar llegada** → *Llegado*. También **mantenimiento** (y volver al terminal).
  - ⚠️ Al marcar salida con pagos pendientes, el sistema **avisa y pide confirmar** los pagos antes de permitirla.
- **Asignar viaje/fecha/chofer/azafata**: solo se puede editar con el bus *En terminal*.
  - El selector de viajes **filtra por la sede del bus** (solo rutas que salen de ella).
- **Trasladar**: mueve el bus a otra sede (se valida el viaje asignado y se registra en la bitácora).
- **Pasajeros a bordo / mapa de asientos**: ficha de cada pasajero del viaje asignado, agrupados por piso; desde cada asiento también se puede **confirmar el pago**.
- **Registrar vehículo** (➕): placa y tipo.

### 3.7 Conductores y Azafatas
- Listado del **equipo** operativo.
- La creación y edición de personal es exclusiva del **administrador**.

### 3.8 Recorridos y traslados (bitácora)
- Historial diario de salidas, llegadas y traslados de la flota.

---

## 4. Para el administrador

Panel de administración con `admin@demo.com` / `admin123`.

**Ingreso:** menú → **Iniciar sesión** → panel de administración.

### 4.1 Resumen
- Estadísticas globales: usuarios por rol, reservas, **pagos pendientes**, vehículos, viajes e **ingresos**.
- Gráfico de **reservas de los últimos 7 días**.
- **Métodos de pago** más usados.
- **Actividad reciente**.

### 4.2 Usuarios
- **➕ Crear usuario**: cualquier rol (cliente, personal, admin).
- **Buscar/filtrar** por nombre, correo o rol.
- **Editar**: rol, estado (activo/inactivo) y contraseña.
- **Activar/Desactivar** cuentas (el usuario desactivado no puede iniciar sesión).
- ⚠️ No se puede desactivar al **único administrador** ni a **tu propia cuenta**.

### 4.3 Permisos
- **Matriz de permisos por rol** (catálogo `permisos` + asignación `rol_permisos`).
- Marca/desmarca permisos y guarda. Los cambios aplican a las cuentas con ese rol.
- El rol `admin` es **fijo** (acceso total) y no se modifica.

### 4.4 Auditoría
- Log de **operaciones sensibles**: usuario, acción, módulo, detalle, resultado, IP y fecha.
- **Filtro por módulo** para buscar operaciones concretas.

---

## 5. Accesibilidad (todas las páginas)

Botón flotante **♿** con panel de opciones (persistentes en tu navegador):

- **Tamaño de letra** (A− / A+).
- **Modo noche**.
- **Máscara de lectura** (regla de lectura).
- **Alto contraste**.
- **Espaciado** ampliado.
- **Modo lectura**.
- **Subrayar enlaces**.
- **Pausar animaciones**.
- **Lectura en voz alta** (Lee el contenido de la página).
- **Idioma**: español / inglés (ES–EN).

También hay un botón flotante de **WhatsApp** para contacto.

---

## 6. Solución de problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| "No puedo iniciar sesión" | Contraseña incorrecta o cuenta desactivada. | Verifica credenciales; si tu cuenta fue desactivada, contacta al administrador. |
| "El registro me rechaza el correo" | Dominio `@personal.pe` reservado. | Usa un correo personal distinto. |
| "El asiento no me deja elegirlo" | Ya está reservado (estado ≠ Liberado) para ese viaje+fecha. | Elige otro asiento o cambia de fecha. |
| "Mi reserva dice Pendiente de confirmación" | Pagaste en efectivo. | Confírmala en la terminal dentro de 6 horas. |
| "El viaje no aparece en el selector de un bus" | No sale de la sede del bus. | Traslada el bus a la sede correcta o elige otro viaje. |
| "No puedo editar el bus" | El bus no está *En terminal*. | Cambia el estado del bus a *En terminal* (si corresponde). |
| "No encuentro una sección del panel" | Tu rol/permisos no incluyen esa sección. | Solicita el permiso al administrador. |

---

## 7. Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@demo.com` | `admin123` |
| Personal | `carlos@personal.pe` | `andes123` |
| Personal | `maria@personal.pe` | `andes123` |
| Cliente | `luis.mendoza@gmail.com` | `cliente123` |

> En un despliegue real se recomienda **cambiar estas contraseñas** o crear cuentas nuevas y desactivar las demo.
