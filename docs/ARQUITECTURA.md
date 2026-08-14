# Arquitectura

## 1. Stack tecnológico

- **Frontend**: HTML5, CSS3 y JavaScript (ES5/ES6, sin transpilación).
- **Sin framework ni librerías externas**: todo se construye con JavaScript vanilla.
- **Sin backend**: la aplicación es 100 % de cliente. El directorio `backend/` existe como reserva pero no se usa.
- **Persistencia**: `localStorage` del navegador. No hay base de datos.
- **Idiomas**: español (es) e inglés (en) mediante un diccionario propio en `js/i18n.js`.

## 2. Estructura de archivos

```
frontend/
├── index.html              # Página de inicio (hero, ventajas, rutas principales)
├── css/style.css           # Estilos globales, layout, tema claro/oscuro y accesibilidad
├── assets/logo.svg         # Logo de Andesbus
├── pages/                  # Páginas internas
│   ├── nosotros.html       # Misión, visión, flota y valores
│   ├── rutas.html          # Búsqueda de viajes por origen/destino
│   ├── reservas.html       # Selección de asientos y pago
│   ├── login.html          # Inicio de sesión (cliente o personal)
│   ├── registro.html       # Alta de cuentas de clientes
│   ├── cuenta.html         # Datos y reservas del cliente
│   ├── contacto.html       # Formulario de contacto
│   └── personal.html       # Panel del personal (requiere sesión de personal)
└── js/
    ├── datos.js            # VIAJES (catálogo), claves de almacenamiento y precio de asientos
    ├── auth.js             # Gestión de usuarios, sesión y credenciales del personal
    ├── i18n.js             # Diccionario ES/EN y funciones t(), aplicarIdioma()
    ├── main.js             # Menú móvil, sesión en navbar, panel de accesibilidad y WhatsApp
    ├── rutas.js            # Filtrado y renderizado de viajes
    ├── reservas.js         # Plano del bus, validación y guardado de reservas
    ├── cuenta.js           # Renderizado de la cuenta del cliente
    ├── login.js            # Autenticación de clientes y personal
    ├── registro.js         # Validación del formulario de registro
    ├── contacto.js         # Validación del formulario de contacto
    └── personal.js         # Panel del personal (flota, equipo, viajes y pagos)
```

## 3. Modelo de datos (`localStorage`)

Todas las claves tienen el prefijo `busEmpresa_`.

| Clave | Contenido | Ejemplo |
|---|---|---|
| `busEmpresa_usuarios` | Lista de cuentas de clientes | `[{ nombre, correo, telefono, contrasena }]` |
| `busEmpresa_sesion` | Usuario con sesión activa | `{ nombre, correo, rol: "cliente" \| "personal", ... }` |
| `busEmpresa_reservas` | Reservas registradas | `[{ id, correoUsuario, viajeId, origen, destino, hora, duracion, fecha, asiento[], pasajeros, total, metodoPago, planFamiliar, estado, fechaReserva }]` |
| `busEmpresa_vehiculos` | Flota de buses | `[{ placa, tipo, estado, conductor, azafata, viajeId, viajeFecha }]` |
| `busEmpresa_equipo` | Lista de conductores y azafatas | `[{ nombre, rol }]` |
| `busEmpresa_viajes_personal` | Viajes creados por el personal | `[{ id, origen, destino, fecha, hora, duracion, precio, personal: true }]` |
| `busEmpresa_idioma` | Idioma activo | `"es"` o `"en"` |
| `busEmpresa_accesibilidad` | Configuración del panel de accesibilidad | `{ tamano, noche, mascara, contraste, ... }` |

### Estados de una reserva

- `Confirmada`: pago verificado (tarjeta, Yape/Plin o transferencia se confirman automáticamente; efectivo requiere confirmación del personal).
- `Pendiente de confirmación`: pago en efectivo aún no verificado en el terminal.
- `Liberado`: reserva deshabilitada o liberada (ya no ocupa asiento).

### Estados de un vehículo

- `En terminal` · `En ruta` · `Llegado` · `En mantenimiento`

## 4. Catálogo de viajes (`VIAJES` en `datos.js`)

Viajes programados de forma fija (12 registros) entre 5 ciudades:

| Origen | Destino | Horas de salida | Precio base (Piso 2) |
|---|---|---|---|
| Lima | Arequipa | 06:00, 12:00, 20:00 | S/ 89–99 |
| Lima | Cusco | 07:30, 15:00, 22:30 | S/ 99–109 |
| Arequipa | Cusco | 08:00, 14:00 | S/ 75 |
| Lima | Trujillo | 09:00, 21:00 | S/ 55–60 |
| Cusco | Puno | 10:30 | S/ 45 |
| Puno | Cusco | 09:00 | S/ 45 |

El personal puede añadir viajes nuevos, que se guardan en `busEmpresa_viajes_personal` y se combinan con el catálogo fijo mediante `todosLosViajes()`.

## 5. Precios de asientos

- Piso 1 (asientos 1–20): `precio base × 1.5` (definido por `PISO1_MULTIPLICADOR`).
- Piso 2 (asientos 21–64): precio base del viaje.
- Plan familiar: descuento del 10 % (`PLAN_FAMILIAR_DESCUENTO`) cuando se seleccionan 6 o más asientos.

## 6. Seguridad y limitaciones

- Las credenciales se validan en el cliente y las contraseñas se guardan **en texto plano** en `localStorage`. Es una aplicación de demostración/estudios, no apta para producción.
- Los correos que terminan en `@personal.pe` están reservados al personal: no se permite registrarlos como clientes (`registro.js`).
- No hay servidor, base de datos ni pasarela de pagos real: los pagos se simulan localmente.
