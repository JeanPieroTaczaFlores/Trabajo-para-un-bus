require('dotenv').config();
const { probarConexion } = require('./config/db');
const app = require('./app');

const PORT = Number(process.env.PORT || 3001);

async function iniciar() {
  try {
    await probarConexion();
    console.log('✔ Conexión a la base de datos establecida.');
  } catch (err) {
    console.warn('⚠ No se pudo conectar a la base de datos:', err.message);
    console.warn('  Revisa DATABASE_URL (Supabase/Postgres) y ejecuta: npm run db:reset');
  }

  app.listen(PORT, () => {
    console.log(`🚌 Andesbus corriendo en http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
  });
}

iniciar();
