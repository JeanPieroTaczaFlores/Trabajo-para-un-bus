/* eslint-disable no-console */
/**
 * Ejecuta schema.sql + seed.sql sobre PostgreSQL (p. ej. Supabase).
 * Requiere la variable DATABASE_URL (en .env o en el entorno).
 * Uso: node database/run.js [create|reset]
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function leer(archivo) {
  return fs.readFileSync(path.join(__dirname, archivo), 'utf8');
}

function conectar() {
  const config = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DATABASE_HOST || '127.0.0.1',
        port: Number(process.env.DATABASE_PORT || 5432),
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'andesbus',
      };
  if (process.env.PGSSL === 'true') {
    config.ssl = { rejectUnauthorized: false };
  }
  return new Pool(config);
}

async function main() {
  const modo = process.argv[2] || 'create';
  const pool = conectar();
  try {
    console.log(`[${modo}] Ejecutando schema.sql ...`);
    // Sin parámetros -> protocolo simple de pg (permite múltiples sentencias)
    await pool.query(leer('schema.sql'));
    console.log(`[${modo}] Ejecutando seed.sql ...`);
    await pool.query(leer('seed.sql'));
    console.log('Base de datos PostgreSQL lista.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Error al inicializar la base de datos:');
  console.error(err.message);
  process.exit(1);
});
