# Guía de uso

## 1. Acceso general

Abre `frontend/index.html` en el navegador. No se necesita instalar nada ni levantar un servidor.

- **Cliente** → puede consultar rutas, reservar y ver su cuenta.
- **Personal** → gestiona la flota, los viajes y los pagos en efectivo.

## 2. Credenciales de acceso

### Clientes de demostración

Los siguientes clientes se crean automáticamente la primera vez que el personal abre su panel (`sembrarDatosDemo()`):

| Nombre | Correo | Contraseña |
|---|---|---|
| Luis Mendoza | luis.mendoza@gmail.com | `cliente123` |
| Diana Quispe | diana.quispe@hotmail.com | `cliente123` |
| Pedro Salas | pedro.salas@gmail.com | `cliente123` |
| Lucía Castro | lucia.castro@gmail.com | `cliente123` |
| Jorge Huamán | jorge.huaman@outlook.com | `cliente123` |
| Renata Paredes | renata.paredes@gmail.com | `cliente123` |
| Adrián Vega | adrian.vega@gmail.com | `cliente123` |
| Kiara Llanos | kiara.llanos@gmail.com | `cliente123` |

### Personal (definido en `js/auth.js`)

| Nombre | Correo | Contraseña |
|---|---|---|
| Carlos Ramírez | carlos@personal.pe | `andes123` |
| María Torres | maria@personal.pe | `andes123` |

> Los correos `@personal.pe` son exclusivos del personal: no se puede registrar una cuenta de cliente con ellos.

## 3. Flujo del cliente

1. **Registro** (`pages/registro.html`): crea una cuenta con nombre completo, correo válido, teléfono de 7–9 dígitos y contraseña de al menos 6 caracteres.
2. **Inicio de sesión** (`pages/login.html`): entra con tu correo y contraseña.
3. **Rutas** (`pages/rutas.html`): busca por origen y destino; cada viaje muestra hora de salida, duración y precio.
4. **Reserva** (`pages/reservas.html?viaje=<id>`):
   - Elige la fecha del viaje (debe ser al menos un día posterior a hoy).
   - Selecciona los asientos en el plano del bus. Piso 1 (premium, asientos 1–20) cuesta más que el Piso 2 (asientos 21–64). Los asientos ocupados aparecen deshabilitados.
   - Elige el método de pago: tarjeta (con validación de datos), Yape/Plin, transferencia o efectivo en terminal.
   - Si son 6 o más asientos, se aplica automáticamente el **plan familiar (−10 %)**.
5. **Cuenta** (`pages/cuenta.html`): consulta tus datos y el historial de reservas con su estado y monto.

### Reglas importantes para el cliente

- 🎫 Al viajar: presentar el **DNI** en ventanilla **30 minutos antes de la salida** para recoger el ticket.
- 💵 **Pago en efectivo**: el pago queda como *Pendiente de confirmación* y debe confirmarse en el terminal en un plazo de **6 horas**; pasado ese plazo, los asientos pueden quedar disponibles para otro pasajero.
- 👨‍👩‍👧‍👦 El descuento familiar es del **10 %** al superar los 5 pasajeros.

## 4. Panel del personal (`pages/personal.html`)

Ingresa con una cuenta `@personal.pe` (por ejemplo, `carlos@personal.pe` / `andes123`).

Secciones del menú lateral:

### 📊 Resumen
Indicadores de clientes registrados, reservas totales, pagos por confirmar y vehículos en ruta.

### 👥 Clientes
Lista de clientes registrados. Al abrir cada uno se ven sus reservas y el botón **Confirmar pago (efectivo)** para las que estén pendientes.

### 🚌 Viajes
Muestra el catálogo fijo (todos los días) y los viajes creados por el personal, agrupados por fecha. Los viajes propios se pueden **eliminar**.

### ➕ Nuevo viaje
Formulario para crear un viaje (origen, destino, fecha, hora, duración y precio base). Al crearlo aparece automáticamente en **Rutas y Horarios** para que los clientes reserven.

### 🚍 Vehículos
Control de la flota:

- **Asignar viaje, fecha, conductor y azafata** a cada bus (solo cuando está *En terminal*; el viaje y la tripulación quedan **bloqueados** mientras el bus está *En ruta* o *Llegado*).
- **Cambiar estado**: *En terminal* → *Marcar salida* (🚀) → *En ruta* → *Marcar llegada* (🏁) → *Llegado* → *Volver al terminal* (🔁). También se puede mandar a **mantenimiento**.
- Al **marcar salida**, si hay pagos en efectivo pendientes para ese viaje, el sistema avisa y pide confirmación antes de permitir la salida.
- Cada tarjeta de vehículo muestra el **mapa de asientos** con los pasajeros a bordo del día. Tocar un asiento ocupado (naranja) abre la **ficha del cliente** con su correo, teléfono y estado de pago.
- Los pagos en efectivo se confirman desde la ficha del asiento o desde la lista de pasajeros, **solo mientras el bus está en terminal** (antes de la salida).
- Permite **registrar vehículos** nuevos (placa y tipo).

### 🧑‍✈️ Equipo
Lista de conductores y azafatas (edición exclusiva de la administración).

## 5. Panel de accesibilidad (todas las páginas)

Botón flotante ♿ con opciones que se guardan en `localStorage` y persisten entre visitas:

- Tamaño de letra (A− / A+)
- Modo noche 🌙
- Máscara de lectura 📖
- Alto contraste 🔆
- Espaciado de texto ↔️
- Modo lectura 📚
- Subrayar enlaces 🔗
- Pausar animaciones ⏸️
- Lectura en voz alta 🗣️ (Web Speech API)
- Idioma ES/EN 🌐

También hay un botón flotante de **WhatsApp** 💬 que abre un chat predefinido con la empresa.

## 6. ¿Cómo se reinician los datos de demostración?

El panel del personal siembra clientes y reservas de ejemplo solo si no existen. Para empezar desde cero, borra el `localStorage` del sitio en el navegador (o limpia las claves `busEmpresa_*`).
