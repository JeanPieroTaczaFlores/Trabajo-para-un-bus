# Guía de despliegue — Andesbus

Publica el proyecto en producción usando **Supabase** (base de datos PostgreSQL) y **Vercel** (hosting del sitio + API). Resultado: una única URL que sirve el frontend y la API.

```
[ Navegador ] → [ Vercel: api/index.js (Express) ] → [ Supabase: PostgreSQL (pooler 6543) ]
```

---

## 0. Requisitos previos

- Cuenta en **GitHub** con el repositorio del proyecto (esta guía usa `Trabajo-para-un-bus`).
- Cuenta en **Supabase** ([supabase.com](https://supabase.com)).
- Cuenta en **Vercel** ([vercel.com](https://vercel.com), se puede entrar con GitHub).
- **Node.js 18+** instalado (opcional, solo para probar local o generar el JWT_SECRET).

---

## 1. Base de datos en Supabase

1. **Crear proyecto**: [supabase.com](https://supabase.com) → **New project** → nombre (ej. `andesbus`), contraseña de BD, región → **Create**. Espera 1–2 min.

2. **Crear tablas y datos**:
   - Menú lateral → **SQL Editor** → **New query**.
   - Pega el contenido de `backend/database/schema.sql` → **Run**.
   - Nueva query con el contenido de `backend/database/seed.sql` → **Run**.
   - Verifica en **Table Editor** que las tablas existen con datos.

3. **Copiar la connection string**:
   - Desde la página del proyecto, botón **Connect** → pestaña **Connection string**.
   - Selecciona **URI** y **Port 6543 (transaction pooler)** (el que se usa con Vercel).
   - Copia la URL, por ejemplo:
     ```
     postgresql://postgres.<proyecto>:<CLAVE>@aws-0-us-east-2.pooler.supabase.com:6543/postgres
     ```
   - **Reemplaza `<CLAVE>`** por la contraseña real del proyecto.
   - Si la contraseña tiene caracteres especiales (`@`, `:`, `/`, `%`, ...), deben ir codificados en la URL (p. ej. `@` → `%40`). Lo más simple es usar una contraseña solo con letras y números.

> Si olvidaste la contraseña: **Connect** → **Reset database password** (no pierde datos).

---

## 2. Subir el código a GitHub

```bash
git add -A
git commit -m "Despliegue inicial"
git push -u origin main
```

El `.gitignore` ya excluye `node_modules/` y `.env` (las credenciales nunca se suben). Los archivos de despliegue ya están en el repo: `package.json` (raíz), `api/index.js`, `vercel.json`, `backend/app.js`.

---

## 3. Desplegar en Vercel

1. [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. Importa el repositorio (ej. `Trabajo-para-un-bus`) → **Import**.
3. Configuración:
   - **Framework Preset**: `Other`.
   - **Root Directory**: `./` (raíz).
   - **Build Command**: vacío.
4. **Environment Variables** (botón Add por cada una):

   | Key | Valor |
   |---|---|
   | `DATABASE_URL` | Tu URL de Supabase (transaction pooler, puerto 6543). |
   | `PGSSL` | `true` |
   | `JWT_SECRET` | Cadena larga y aleatoria (ver abajo cómo generarla). |
   | `JWT_EXPIRES_IN` | `8h` |
   | `COOKIE_NAME` | `andesbus_token` |

   > `APP_BASE_URL`: se agrega después, con la URL final de Vercel (la usa el enlace de "restablecer contraseña").

   Para generar `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy** → espera 1–3 min. Al terminar, Vercel muestra la URL, por ejemplo `https://trabajo-para-un-bus.vercel.app`.
6. Ve a **Project → Settings → Environment Variables** → agrega `APP_BASE_URL` con tu URL final → en **Deployments**, **Redeploy** el último deploy.

---

## 4. Verificar

| Prueba | Resultado esperado |
|---|---|
| Abrir la URL | Carga el frontend de Andesbus. |
| `https://TU-URL/api/health` | `{ "ok": true, "servicio": "andesbus-api", ... }` |
| Login `admin@demo.com` / `admin123` | Entra al panel de administración. |
| Hacer una reserva | Se guarda en la base y aparece en el historial del cliente. |

---

## 5. Mantenimiento y actualizaciones

- **Nuevas versiones**: cualquier `git push` a `main` **redepliega automáticamente** en Vercel.
- **Cambios de esquema**: ejecuta los nuevos SQL en el SQL Editor de Supabase (o ejecuta `schema.sql` + `seed.sql` en un entorno de prueba primero).
- **Reiniciar datos**: en Supabase, borra las tablas y vuelve a correr `schema.sql` y `seed.sql` (o crea un proyecto nuevo).
- **Desarrollo local**: `cd backend && npm install && npm run db:reset && node server.js` (apuntando `backend/.env` a tu base PostgreSQL).

---

## 6. Solución de problemas

| Síntoma | Causa | Solución |
|---|---|---|
| `ECONNREFUSED` / "no se puede conectar" | `DATABASE_URL` incorrecta o sin pooler. | Usa el transaction pooler (puerto 6543) con `PGSSL=true`. |
| `password authentication failed` | Contraseña mal copiada o con caracteres sin codificar. | Corrige la contraseña en la URL; codifica caracteres especiales. |
| `42P01 relation does not exist` | No se ejecutó el `schema.sql`. | Corre `schema.sql` (y `seed.sql`) en el SQL Editor de Supabase. |
| Build falla en Vercel | Faltan dependencias en la raíz. | Verifica que `package.json` (raíz) lista `express`, `pg`, etc. |
| El login "no recuerda" la sesión | Cookie en HTTP o `APP_BASE_URL` mal configurada. | En Vercel (HTTPS) la cookie es `secure`; confirma `APP_BASE_URL`. |
