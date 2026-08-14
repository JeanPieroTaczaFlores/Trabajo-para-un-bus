# Andesbus 🚌

Sitio web de una empresa de transporte de pasajeros por carretera. Permite consultar rutas y horarios, reservar asientos en buses de dos pisos, pagar por tarjeta, Yape/Plin, transferencia o efectivo, y gestionar la flota desde un **panel de personal**.

Proyecto desarrollado en **HTML, CSS y JavaScript puro** (sin frameworks ni backend): todos los datos se guardan en el `localStorage` del navegador.

## ✨ Funcionalidades

- 🚏 **Rutas y horarios**: búsqueda de viajes por origen y destino entre Lima, Arequipa, Cusco, Trujillo y Puno.
- 🪑 **Reserva de asientos**: plano interactivo de un bus de 2 pisos (64 asientos). Piso 1 *premium* (1–20) y piso 2 *económico* (21–64), con escaleras laterales y servicios por asiento.
- 💳 **Pagos**: tarjeta, Yape/Plin, transferencia y efectivo en terminal (con confirmación del personal en un plazo de 6 horas).
- 👨‍👩‍👧‍👦 **Plan familiar**: 10 % de descuento al superar 5 pasajeros en una misma reserva.
- 👥 **Registro e inicio de sesión** de clientes.
- 🧑‍✈️ **Panel del personal**: control de vehículos (salida, llegada, mantenimiento), asignación de viajes, conductores y azafatas, creación de viajes nuevos, confirmación de pagos en efectivo y mapa de asientos con la ficha de cada pasajero.
- ♿ **Accesibilidad**: tamaño de letra, modo noche, máscara de lectura, alto contraste, espaciado, modo lectura, subrayado de enlaces, pausar animaciones, lectura en voz alta e idioma ES/EN.
- 💬 Botón flotante de WhatsApp.

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Stack, estructura de archivos y modelo de datos (claves de `localStorage`). |
| [docs/GUIA_DE_USO.md](docs/GUIA_DE_USO.md) | Manual de uso para clientes y personal, con credenciales de acceso. |
| [docs/FLUJOS.md](docs/FLUJOS.md) | Lógica de negocio: precios, reservas, pagos y control de flota. |

## 🚀 Cómo ejecutar

No requiere instalación ni servidor. Abre `frontend/index.html` directamente en el navegador (o usa cualquier servidor estático, por ejemplo `npx serve frontend`).

## 🗂️ Estructura

```
bus-empresa/
├── frontend/
│   ├── index.html          # Página de inicio
│   ├── css/style.css       # Estilos globales
│   ├── assets/logo.svg     # Logo de la marca
│   ├── pages/              # Páginas del sitio
│   │   ├── nosotros.html   # Información de la empresa
│   │   ├── rutas.html      # Rutas y horarios
│   │   ├── reservas.html   # Reserva de asientos
│   │   ├── login.html      # Inicio de sesión
│   │   ├── registro.html   # Registro de clientes
│   │   ├── cuenta.html     # Cuenta y reservas del cliente
│   │   ├── contacto.html   # Formulario de contacto
│   │   └── personal.html   # Panel del personal
│   └── js/
│       ├── datos.js        # Catálogo de viajes y utilidades de precio
│       ├── auth.js         # Autenticación y credenciales del personal
│       ├── i18n.js         # Traducciones ES/EN
│       ├── main.js         # Navbar, accesibilidad, botón WhatsApp
│       ├── rutas.js        # Búsqueda de viajes
│       ├── reservas.js     # Reserva de asientos y pagos
│       ├── cuenta.js       # Vista de cuenta del cliente
│       ├── login.js        # Lógica de inicio de sesión
│       ├── registro.js     # Validación de registro
│       ├── contacto.js     # Validación del formulario de contacto
│       └── personal.js     # Panel del personal (flota, pagos, viajes)
├── backend/                # Reservado (sin uso actual; app 100 % frontend)
└── docs/                   # Documentación del proyecto
```
