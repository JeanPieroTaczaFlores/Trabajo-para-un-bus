# Andesbus 🚌

Plataforma web de una empresa de transporte de pasajeros por carretera: rutas y horarios, reserva de asientos en buses de dos pisos, pagos (tarjeta, Yape/Plin, transferencia o efectivo), panel de personal para la operación de la flota y panel de administración.

Proyecto **full-stack**: frontend en **HTML, CSS y JavaScript puro** (sin frameworks), **API REST en Node.js/Express** y base de datos **MySQL/MariaDB**.

## ✨ Funcionalidades

- 🚏 **Rutas y horarios**: búsqueda de viajes por origen y destino entre Lima, Arequipa, Cusco, Trujillo y Puno.
- 🪑 **Reserva de asientos**: plano interactivo de un bus de 2 pisos (64 asientos). Piso 1 *premium* (1–20, precio ×1.5) y piso 2 *económico* (21–64). Bloqueo de asientos en transacción para evitar dobles reservas.
- 💳 **Pagos**: tarjeta, Yape/Plin, transferencia (se confirman al instante) y efectivo en terminal (requiere confirmación del personal en un plazo de 6 horas).
- 👨‍👩‍👧‍👦 **Plan familiar**: 10 % de descuento al reservar 6 o más asientos.
- 🔐 **Autenticación por roles**: cliente, personal y administrador, con contraseñas cifradas (bcrypt), sesión por cookie httpOnly (JWT) y permisos granulares.
- 🧑‍✈️ **Panel del personal**: resumen, clientes y pagos, viajes, vehículos con mapa de pasajeros, conductores/azafatas y bitácora de recorridos y traslados.
- 🛡️ **Panel de administración**: estadísticas, gestión de usuarios (CRUD), permisos por rol y auditoría de operaciones.
- 🏙️ **Sedes**: cada bus pertenece a una sede y solo toma rutas que salgan de ella; al llegar queda en la ciudad de destino y puede trasladarse a otra sede.
- 🧭 **Bitácora**: historial de recorridos (salidas/llegadas) y traslados de buses entre sedes.
- ♿ **Accesibilidad**: tamaño de letra, modo noche, máscara de lectura, alto contraste, espaciado, modo lectura, subrayado de enlaces, pausar animaciones, lectura en voz alta e idioma ES/EN.

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Stack, estructura de archivos, API, modelo de datos y seguridad. |
| [docs/GUIA_DE_USO.md](docs/GUIA_DE_USO.md) | Manual de uso para clientes, personal y administración, con credenciales. |
| [docs/FLUJOS.md](docs/FLUJOS.md) | Lógica de negocio: precios, reservas, pagos, control de flota y permisos. |
| [backend/database/README.md](backend/database/README.md) | Base de datos: esquema, seed y comandos. |

## 🚀 Cómo ejecutar

Requisitos: **Node.js 18+** y un servidor **MySQL/MariaDB** (por ejemplo, el MySQL de XAMPP, administrable con MySQL Workbench).

```bash
# 1. Crear la base de datos (schema + seed)
cd backend
npm install
npm run db:reset

# 2. Levantar la API + el frontend (mismo puerto)
node server.js
```

Abre `http://localhost:3001`. La API queda en `http://localhost:3001/api`.

> Para desarrollo en local: `backend/.env.example` contiene las variables de entorno (DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, PORT). Copia a `backend/.env` si tu MySQL no usa root sin contraseña.

## 🗂️ Estructura

```
bus-empresa/
├── frontend/                 # Sitio (HTML/CSS/JS vanilla)
│   ├── index.html            # Página de inicio
│   ├── css/style.css         # Estilos globales
│   ├── pages/
│   │   ├── publica/          # nosotros, contacto
│   │   ├── cliente/          # rutas, reservas, login, registro, cuenta
│   │   ├── personal/         # panel del personal (personal.html)
│   │   └── administrador/    # panel de administración (admin.html)
│   └── js/
│       ├── core/             # api.js, auth.js, i18n.js, main.js
│       ├── cliente/          # rutas, reservas, login, registro, cuenta
│       ├── personal/         # panel del personal
│       └── administrador/    # panel de administración
├── backend/                  # API REST (Node.js/Express) + MySQL
│   ├── server.js             # Arranque: API + frontend estático
│   ├── config/db.js          # Pool de conexiones MySQL
│   ├── controllers/          # Lógica de negocio por módulo
│   ├── middleware/           # auth (JWT/cookie/RBAC), validación, errores
│   ├── routes/               # Definición de endpoints
│   ├── database/             # schema.sql, seed.sql y run.js (npm run db:reset)
│   └── utils/                # asyncHandler, auditoría, errores HTTP
└── docs/                     # Documentación del proyecto
```
