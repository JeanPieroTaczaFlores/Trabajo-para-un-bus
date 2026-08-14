/* eslint-disable no-console */
/**
 * Ejecuta schema.sql + seed.sql sobre la base configurada en .env
 * Uso: node database/run.js [create|reset]   (default: create)
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  multipleStatements: true,
};

function leer(archivo) {
  return fs.readFileSync(path.join(__dirname, archivo), 'utf8');
}

async function main() {
  const modo = process.argv[2] || 'create';
  if (modo === 'reset') {
    // Conecta sin DB para poder soltar y recrear la base
    const base = await mysql.createConnection(config);
    await base.query(`DROP DATABASE IF EXISTS ${process.env.DATABASE_NAME || 'andesbus'}`);
    await base.end();
  }

  const conn = await mysql.createConnection(config);
  console.log('Ejecutando schema.sql ...');
  await conn.query(leer('schema.sql'));
  console.log('Ejecutando seed.sql ...');
  await conn.query(leer('seed.sql'));
  await conn.end();
  console.log(`Base de datos "${process.env.DATABASE_NAME || 'andesbus'}" lista.`);
}

main().catch((err) => {
  console.error('Error al inicializar la base de datos:');
  console.error(err.message);
  process.exit(1);
});
