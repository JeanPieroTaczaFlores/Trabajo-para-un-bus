# Andesbus 🚌

Plataforma web de una empresa de transporte de pasajeros por carretera: rutas y horarios, reserva de asientos en buses de dos pisos, pagos (tarjeta, Yape/Plin, transferencia o efectivo), panel de personal para la operación de la flota y panel de administración.

Proyecto **full-stack**: frontend en **HTML, CSS y JavaScript puro** (sin frameworks), **API REST en Node.js/Express** y base de datos **PostgreSQL** (hosting en **Supabase**). Desplegado en **Vercel**.

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
| [docs/REQUISITOS.md](docs/REQUISITOS.md) | Especificación de requisitos del sistema (actores, funcionales y no funcionales). |
| [docs/MANUAL_DE_USUARIO.md](docs/MANUAL_DE_USUARIO.md) | Manual de usuario detallado para clientes, personal y administración. |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Stack, estructura de archivos, API, modelo de datos y seguridad. |
| [docs/GUIA_DE_USO.md](docs/GUIA_DE_USO.md) | Guía rápida de uso y credenciales de demostración. |
| [docs/FLUJOS.md](docs/FLUJOS.md) | Lógica de negocio: precios, reservas, pagos, control de flota y permisos. |
| [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md) | Despliegue paso a paso en Supabase (PostgreSQL) y Vercel. |
| [backend/database/README.md](backend/database/README.md) | Base de datos: esquema, seed y comandos. |

## 🚀 Cómo ejecutar

Requisitos: **Node.js 18+** y una base **PostgreSQL** (la más sencilla: un proyecto en [Supabase](https://supabase.com) o una instancia local).

```bash
# 1. Instalar dependencias del backend
cd backend
npm install

# 2. Configurar variables de entorno
#    Copia backend/.env.example a backend/.env y completa DATABASE_URL, JWT_SECRET, etc.

# 3. Crear la base de datos (schema + seed)
npm run db:reset

# 4. Levantar la API + el frontend (mismo puerto)
node server.js
```

Abre `http://localhost:3001`. La API queda en `http://localhost:3001/api`.

> En producción, la app se publica en **Vercel** (una sola URL sirve API + frontend). Ver [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md).

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
├── backend/                  # API REST (Node.js/Express) + PostgreSQL
│   ├── app.js                # App Express (API + frontend estático), exportada
│   ├── server.js             # Arranque local (escucha el puerto)
│   ├── config/db.js          # Pool PostgreSQL + capa de compatibilidad
│   ├── controllers/          # Lógica de negocio por módulo
│   ├── middleware/           # auth (JWT/cookie/RBAC), validación, errores
│   ├── routes/               # Definición de endpoints
│   ├── database/             # schema.sql, seed.sql y run.js (npm run db:reset)
│   └── utils/                # asyncHandler, auditoría, errores HTTP
├── api/index.js              # Función serverless de Vercel (exporta la app)
├── package.json              # Dependencias del proyecto (usadas por Vercel)
├── vercel.json               # Configuración de Vercel (rewrite a /api/index)
└── docs/                     # Documentación del proyecto
```
