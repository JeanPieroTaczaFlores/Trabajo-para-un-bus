# Flujos de negocio

Este documento describe las reglas de negocio implementadas en la aplicación.

## 1. Reserva de asientos

El cliente inicia la reserva desde **Rutas y Horarios** (`rutas.html`) pulsando *Reservar* en un viaje. La página redirige a `reservas.html?viaje=<id>`.

Validaciones del formulario:

1. **Fecha**: obligatoria y debe ser al menos 1 día posterior a la fecha actual (se fija `min = hoy + 1` en el input).
2. **Asientos**: al menos 1 asiento seleccionado.
3. **Método de pago**: obligatorio.
4. **Tarjeta**: si el método es tarjeta, el número debe tener 16 dígitos, el titular 3+ caracteres, vencimiento con formato `MM/AA` y CVV de 3–4 dígitos.

Al confirmar:

- Se calcula el total con el precio por piso (Piso 1 = `precio base × 1.5`).
- Si hay **6 o más asientos**, se aplica el **plan familiar** (10 % de descuento) y se guarda `planFamiliar: true`.
- Se crea la reserva con un `id` único (`Date.now()`).
- **Pago en efectivo** → estado `Pendiente de confirmación` (requiere confirmación del personal en el terminal en 6 horas).
- **Tarjeta / Yape / Transferencia** → estado `Confirmada`.
- Se redibuja el plano para marcar los nuevos asientos como ocupados.

### Ocupación de asientos

Un asiento está ocupado cuando existe una reserva del mismo `viajeId` y la misma `fecha` con estado distinto de `Liberado`. Los asientos ocupados se muestran deshabilitados en el plano.

## 2. Confirmación de pagos en efectivo

El personal confirma los pagos en efectivo desde el panel (`personal.html`) en dos lugares:

- **Sección Clientes**: botón *Confirmar pago (efectivo)* por cada reserva pendiente.
- **Sección Vehículos**: botón *Confirmar pago* dentro de la ficha del pasajero (tocando un asiento ocupado) o en la lista *Pasajeros a bordo*.

Restricciones:

- El botón de confirmación **solo aparece mientras el bus está `En terminal`**.
- Si el bus ya está *En ruta* o *Llegado*, se muestra la nota *"Confirmar antes de la salida"* y no se puede confirmar desde el bus.
- Al confirmar, la reserva pasa a `Confirmada`.

### Aviso al marcar salida

Al pulsar **Marcar salida** en un vehículo, el sistema busca reservas *Pendientes de confirmación* para el viaje asignado (y fecha del viaje, si la hay). Si existen, muestra un diálogo de confirmación: *"⚠️ Hay N pago(s) en efectivo pendiente(s) para <placa>. Confirma los pagos antes de la salida. ¿Salir de todos modos?"*. El personal decide si cancela o continúa.

## 3. Control de vehículos

Estados y transiciones válidas:

```
En terminal ──Marcar salida──▶ En ruta ──Marcar llegada──▶ Llegado
     ▲                            │
     │                            └─ (viaje o mantenimiento)
     └────────── Volver al terminal ◀── En mantenimiento
```

- **Asignación de viaje/fecha/conductores/azafata**: solo se puede modificar cuando el bus está *En terminal*. Mientras está *En ruta* o *Llegado* los selects quedan deshabilitados (viaje y tripulación "fijos").
- **En mantenimiento**: solo se puede devolver el bus al terminal (botón *Reparado → Terminal*).
- Los **pasajeros a bordo** se listan a partir de las reservas del `viajeId` (y `viajeFecha` del vehículo), agrupados por piso. Los vehículos sin viaje asignado muestran un aviso en lugar del plano.

## 4. Viajes creados por el personal

- Se guardan en `busEmpresa_viajes_personal` con `personal: true`.
- `todosLosViajes()` devuelve la unión del catálogo fijo (`VIAJES`) y los viajes del personal, por lo que aparecen automáticamente en Rutas y Horarios y pueden reservarse como cualquier otro.
- En el panel, los viajes propios muestran la etiqueta *"Creado por personal"* y pueden eliminarse.

## 5. Sembrado de datos de demostración

Al abrir el panel del personal (`sembrarDatosDemo()`):

- Si no existen los 8 clientes de ejemplo, se agregan con contraseña `cliente123`.
- Si no existen las reservas de ejemplo (ids `900000001`–`900000008`), se crean para los viajes 1 y 4, con pagos mixtos (efectivo pendiente, tarjeta, Yape y transferencia confirmados).

Esto permite demostrar el panel completo (clientes, pagos pendientes y pasajeros a bordo) sin configuración manual.

## 6. Sesión y permisos

- La sesión se guarda en `busEmpresa_sesion`.
- `personal.html` redirige a login si no hay sesión o si `sesion.rol !== "personal"`.
- `cuenta.html` y `reservas.html` exigen sesión de cliente.
- El enlace *Reservar* del navbar redirige a login si no hay sesión.
- El rol `personal` se asigna solo a los usuarios de `PERSONAL_USUARIOS` (correos `@personal.pe`); el registro de clientes bloquea ese dominio.
