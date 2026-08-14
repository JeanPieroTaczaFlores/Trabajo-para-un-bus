require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const { probarConexion } = require('./config/db');
const { autenticar } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error');

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Autenticación opcional: llena req.usuario si existe cookie válida
app.use(autenticar);

// ---- API -------------------------------------------------------------
const api = express.Router();

api.get('/health', (req, res) => {
  res.json({ ok: true, servicio: 'andesbus-api', fecha: new Date().toISOString() });
});

api.use('/auth', require('./routes/auth.routes'));
api.use('/perfil', require('./routes/perfil.routes'));
api.use('/viajes', require('./routes/viajes.routes'));
api.use('/reservas', require('./routes/reservas.routes'));
api.use('/clientes', require('./routes/clientes.routes'));
api.use('/equipo', require('./routes/equipo.routes'));
api.use('/vehiculos', require('./routes/vehiculos.routes'));
api.use('/viajes-personal', require('./routes/viajesPersonal.routes'));
api.use('/pagos', require('./routes/pagos.routes'));
api.use('/bitacora', require('./routes/bitacora.routes'));
api.use('/admin', require('./routes/admin.routes'));

api.use((req, res, next) => {
  res.status(404).json({ error: { mensaje: 'Ruta no encontrada.', codigo: 'not_found' } });
});

app.use('/api', api);

// ---- Frontend estático ------------------------------------------------
const frontend = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontend));

app.get('/', (req, res) => res.sendFile(path.join(frontend, 'index.html')));
app.get('*', (req, res) => {
  const destino = path.join(frontend, req.path);
  res.sendFile(destino, (err) => {
    if (err) res.sendFile(path.join(frontend, 'index.html'));
  });
});

// ---- Manejo central de errores ----------------------------------------
app.use(errorHandler);

async function iniciar() {
  try {
    await probarConexion();
    console.log('✔ Conexión a la base de datos establecida.');
  } catch (err) {
    console.warn('⚠ No se pudo conectar a la base de datos:', err.message);
    console.warn('  Ejecuta el servidor MySQL/MariaDB (XAMPP) y luego: npm run db:reset');
  }

  app.listen(PORT, () => {
    console.log(`🚌 Andesbus corriendo en http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
  });
}

iniciar();
