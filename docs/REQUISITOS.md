# Especificación de Requisitos — Andesbus

Documento de requisitos del sistema web de la empresa de transporte **Andesbus**. Define el contexto, los actores, los requisitos funcionales y no funcionales, y las restricciones técnicas.

## 1. Introducción

### 1.1 Propósito
Plataforma web para la venta y gestión de pasajes interprovinciales de una empresa de transporte de pasajeros. Permite a los **clientes** consultar rutas, reservar asientos y pagar en línea; al **personal** operar la flota (viajes, vehículos, tripulación, pagos en efectivo y bitácora); y al **administrador** gestionar usuarios, permisos y auditoría.

### 1.2 Alcance
- Venta de pasajes por origen–destino entre las ciudades de Lima, Arequipa, Cusco, Trujillo y Puno.
- Reserva de asientos en buses de dos pisos (64 asientos) con bloqueo transaccional para evitar dobles reservas.
- Métodos de pago: tarjeta, Yape/Plin, transferencia y efectivo (en terminal).
- Plan familiar (−10 % con 6 o más asientos).
- Paneles de cliente, personal y administración.
- Accesibilidad web (WCAG orientativo) y bilingüe ES/EN.

### 1.3 Definiciones, siglas y abreviaturas
| Término | Definición |
|---|---|
| **Asiento premium** | Asientos 1–20 (piso 1). Precio base ×1.5. |
| **Asiento económico** | Asientos 21–64 (piso 2). Precio base. |
| **Plan familiar** | Descuento del 10 % en reservas de 6 o más asientos. |
| **Sede** | Ciudad donde un bus tiene base. Un bus solo toma rutas que salen de su sede. |
| **Bitácora** | Registro histórico de recorridos (salidas/llegadas) y traslados de buses. |
| **JWT** | JSON Web Token; sesión del usuario guardada en cookie httpOnly. |
| **RBAC** | Control de acceso por roles (cliente, personal, admin) + permisos granulares. |

## 2. Usuarios y actores

| Actor | Descripción | Acceso |
|---|---|---|
| **Visitante** | Usuario sin sesión. | Navegar, ver rutas y precios, registrarse, iniciar sesión. |
| **Cliente** | Usuario registrado. | Reservar asientos, pagar, ver/cancelar sus reservas, editar su perfil. |
| **Personal** | Empleado operativo (cuentas `@personal.pe`). | Panel de personal según permisos: clientes, reservas, pagos, viajes, vehículos, equipo, bitácora. |
| **Administrador** | Rol con acceso total. | Estadísticas, usuarios, permisos y auditoría. |

## 3. Requisitos funcionales (RF)

### 3.1 Gestión de cuentas
| ID | Requisito |
|---|---|
| RF-01 | El sistema debe permitir **registrar** clientes con nombre completo, correo válido, teléfono (7–9 dígitos) y contraseña (mínimo 6 caracteres). |
| RF-02 | El rol de una cuenta nueva debe asignarse en el **servidor** como `cliente`; el usuario nunca elige su rol. |
| RF-03 | El sistema debe **rechazar** el registro con correos del dominio `@personal.pe` (reservados al personal). |
| RF-04 | El sistema debe permitir **iniciar/cerrar sesión** y validar credenciales con hash bcrypt. |
| RF-05 | El sistema debe **denegar el acceso** a cuentas desactivadas (`activo = false`). |
| RF-06 | El administrador debe poder **crear** usuarios con cualquier rol y **editar** rol, estado y contraseña. |
| RF-07 | El sistema debe impedir desactivar a la **única** cuenta administradora o a la propia cuenta en sesión. |

### 3.2 Consulta de viajes
| ID | Requisito |
|---|---|
| RF-10 | El sistema debe mostrar viajes disponibles filtrando por **origen** y **destino**. |
| RF-11 | Cada viaje debe mostrar **hora de salida, duración y precio base**. |
| RF-12 | El sistema debe permitir consultar los **asientos ocupados** de un viaje para una fecha concreta. |
| RF-13 | El personal debe poder **crear viajes adicionales** al catálogo fijo y **eliminarlos**; aparecen en la búsqueda pública. |

### 3.3 Reserva y pago
| ID | Requisito |
|---|---|
| RF-20 | La reserva debe requerir: un **viaje activo**, una **fecha** (mínimo un día posterior a hoy), **asientos 1–64** libres y un **método de pago**. |
| RF-21 | El sistema debe **bloquear los asientos en transacción** (`SELECT ... FOR UPDATE`) para evitar dobles reservas. |
| RF-22 | El **precio** debe calcularse por piso: piso 1 = base ×1.5, piso 2 = base. |
| RF-23 | Con **6 o más asientos** se debe aplicar el **plan familiar (−10 %)**. |
| RF-24 | **Efectivo** → estado `Pendiente de confirmación`; **tarjeta/Yape/transferencia** → `Confirmada`. |
| RF-25 | El cliente debe ver el **historial de sus reservas** (origen, destino, fecha, asientos, total, estado) y **cancelar** reservas (pasando a `Liberado`, liberando sus asientos). |
| RF-26 | El personal debe poder **confirmar el pago en efectivo** de una reserva pendiente (solo antes de la salida del bus). |
| RF-27 | Al marcar la **salida** de un vehículo con pagos pendientes, el sistema debe **avisar y pedir confirmación** antes de permitir la salida. |

### 3.4 Operación de la flota
| ID | Requisito |
|---|---|
| RF-30 | El personal debe poder **registrar vehículos** (placa y tipo). |
| RF-31 | Los estados del vehículo deben seguir las transiciones: `En terminal → En ruta → Llegado` y `En terminal → En mantenimiento → En terminal`. |
| RF-32 | La **asignación de viaje/fecha/chofer/azafata** solo debe poder modificarse con el bus `En terminal`. |
| RF-33 | Un bus solo puede tomar rutas cuyo **origen coincida con su sede** (el selector filtra y el backend valida). |
| RF-34 | Al marcar **llegada**, la `sede` del bus se actualiza al **destino** de la ruta. |
| RF-35 | Un bus `En terminal` puede **trasladarse a otra sede**; si tenía un viaje incompatible, se le desasigna; el traslado se registra en la bitácora. |
| RF-36 | El sistema debe listar los **pasajeros a bordo** (reservas del viaje+fecha asignados al vehículo, agrupados por piso). |
| RF-37 | El sistema debe mantener la **bitácora** de recorridos y traslados (los últimos 500 registros). |

### 3.5 Administración
| ID | Requisito |
|---|---|
| RF-40 | El panel de administración debe mostrar **estadísticas**: usuarios por rol, reservas, pagos pendientes, vehículos, viajes, ingresos, reservas de los últimos 7 días, métodos de pago y actividad reciente. |
| RF-41 | El administrador debe poder gestionar el **catálogo de permisos por rol** (`rol_permisos`); el rol `admin` es fijo con acceso total. |
| RF-42 | El sistema debe registrar en **auditoría** las operaciones sensibles (usuario, acción, módulo, detalle, resultado, IP) y permitir filtrarlas. |

### 3.6 Accesibilidad e idiomas
| ID | Requisito |
|---|---|
| RF-50 | Todas las páginas deben incluir un botón de **accesibilidad** con: tamaño de letra, modo noche, máscara de lectura, alto contraste, espaciado, modo lectura, subrayado de enlaces, pausar animaciones y lectura en voz alta. |
| RF-51 | La interfaz debe ser **bilingüe ES/EN** con conmutación persistente. |
| RF-52 | Debe existir un botón flotante de **WhatsApp** de contacto. |

## 4. Requisitos no funcionales (RNF)

| ID | Requisito |
|---|---|
| RNF-01 | **Seguridad**: contraseñas con hash bcrypt; sesión por cookie httpOnly + `sameSite` (+ `secure` en HTTPS); consultas preparadas (SQL injection mitigado); autorización por rol/permiso en el servidor. |
| RNF-02 | **Integridad**: las reservas usan transacciones con bloqueo de filas; la BD aplica claves foráneas y restricciones `CHECK`. |
| RNF-03 | **Rendimiento**: el frontend es estático sin frameworks; la API responde JSON; en producción se usa el *transaction pooler* de Supabase (puerto 6543) para conexiones serverless en Vercel. |
| RNF-04 | **Disponibilidad**: el sitio se sirve desde Vercel (CDN global, HTTPS automático); la base de datos vive en Supabase (instancia gestionada, backups automáticos en plan pagado). |
| RNF-05 | **Compatibilidad**: funciona en navegadores modernos (ES6+); Node.js 18+; PostgreSQL 15+. |
| RNF-06 | **Mantenibilidad**: separación de capas (rutas → controladores → BD); capa de acceso a datos centralizada en `config/db.js`; documentación en `docs/`. |
| RNF-07 | **Usabilidad**: diseño responsive, navegación por rol, mensajes de error en formato JSON, validación en el cliente y el servidor. |
| RNF-08 | **Confidencialidad**: sin secretos en el repositorio; credenciales solo en variables de entorno. |
| RNF-09 | **Accesibilidad (WCAG)**: opciones de accesibilidad persistentes en `localStorage` (ver RF-50). |

## 5. Restricciones y dependencias

- **Frontend**: HTML/CSS/JS puro, sin frameworks ni transpilación.
- **Backend**: Node.js + Express 4; dependencias `pg`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `express-validator`, `dotenv`.
- **Base de datos**: PostgreSQL 15+ (Supabase en producción). El código de acceso a datos mantiene la firma `mysql2` sobre `pg` mediante la capa de compatibilidad de `backend/config/db.js`.
- **Despliegue**: Vercel (función serverless `api/index.js`), variables de entorno `DATABASE_URL`, `PGSSL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_NAME`, `APP_BASE_URL`.
- **Datos de demostración**: el seed crea cuentas demo (ver [GUIA_DE_USO.md](GUIA_DE_USO.md#3-credenciales-de-acceso-demo)).

## 6. Reglas de negocio

- Piso 1 (asientos 1–20): precio base × 1.5; piso 2 (21–64): precio base.
- Plan familiar: −10 % con 6 o más asientos.
- Efectivo: estado `Pendiente de confirmación` (confirmación del personal; el cliente tiene 6 horas).
- Asiento ocupado: existe reserva del mismo viaje+fecha con estado ≠ `Liberado`.
- Regla de sedes: el origen de la ruta debe coincidir con la sede del bus.
- Protecciones administrativas: no se puede desactivar al único admin ni a la propia cuenta.

Detalle de la implementación en [FLUJOS.md](FLUJOS.md).
