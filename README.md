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
- 🏙️ **Sedes**: cada bus pertenece a una sede (Lima, Arequipa, Cusco, Trujillo o Puno) y solo toma rutas que salgan de ella; al llegar queda en la ciudad de destino y puede trasladarse a otra sede.
- 🧭 **Bitácora**: historial por día de recorridos (salidas) y traslados de buses entre sedes.
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
│   ├── index.html              # Página de inicio
│   ├── css/style.css           # Estilos globales
│   ├── assets/logo.svg         # Logo de la marca
│   ├── pages/
│   │   ├── publica/            # Páginas públicas (nosotros, contacto)
│   │   ├── cliente/            # Páginas del cliente (rutas, reservas, login, registro, cuenta)
│   │   └── personal/           # Panel del personal (personal.html)
│   └── js/
│       ├── core/               # Núcleo compartido (datos, auth, i18n, main)
│       ├── publica/            # contacto.js
│       ├── cliente/            # rutas, reservas, login, registro, cuenta
│       └── personal/           # personal.js (panel: flota, viajes, sedes, bitácora)
├── backend/                # Reservado (sin uso actual; app 100 % frontend)
└── docs/                   # Documentación del proyecto
```
