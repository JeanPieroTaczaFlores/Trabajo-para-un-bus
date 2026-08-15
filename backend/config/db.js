require('dotenv').config();
const { Pool, types } = require('pg');

/* ------------------------------------------------------------------ */
/* Parseadores de tipos: imitan mysql2 con dateStrings: true           */
/* ------------------------------------------------------------------ */

function rellenar(n) {
  return String(n).padStart(2, '0');
}

// DATE (1082) -> 'YYYY-MM-DD'
function parsearFecha(valor) {
  if (valor == null) return null;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${rellenar(d.getMonth() + 1)}-${rellenar(d.getDate())}`;
}

// TIMESTAMP / TIMESTAMPTZ (1114 / 1184) -> 'YYYY-MM-DD HH:MM:SS' (hora local)
function parsearTimestamp(valor) {
  if (valor == null) return null;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${rellenar(d.getMonth() + 1)}-${rellenar(d.getDate())} ` +
         `${rellenar(d.getHours())}:${rellenar(d.getMinutes())}:${rellenar(d.getSeconds())}`;
}

// DATE
types.setTypeParser(1082, parsearFecha);
// TIMESTAMP
types.setTypeParser(1114, parsearTimestamp);
// TIMESTAMPTZ
types.setTypeParser(1184, parsearTimestamp);
// INT8 (COUNT(*) y similares) -> number
types.setTypeParser(20, (v) => parseInt(v, 10));

/* ------------------------------------------------------------------ */
/* Pool de conexiones                                                  */
/* ------------------------------------------------------------------ */

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

const pool = new Pool(config);
const consultaNativa = pool.query.bind(pool);

/**
 * Convierte los placeholders '?' (estilo mysql2) a $1, $2, ...
 * y expande los parámetros tipo array (equivalente a IN (?) de mysql2).
 */
function convertirSQL(sql, params) {
  let resultado = '';
  const nuevosParams = [];
  let enString = false;
  let i = 0;

  for (let c = 0; c < sql.length; c++) {
    const ch = sql[c];
    if (enString) {
      if (ch === "'") {
        if (sql[c + 1] === "'") {
          resultado += "''";
          c += 1;
          continue;
        }
        enString = false;
      }
      resultado += ch;
      continue;
    }
    if (ch === "'") {
      enString = true;
      resultado += ch;
      continue;
    }
    if (ch === '?') {
      const valor = params[i];
      i += 1;
      if (Array.isArray(valor)) {
        resultado += valor.map((_, j) => `$${i + j}`).join(', ');
        nuevosParams.push(...valor);
        i += valor.length - 1;
      } else {
        resultado += `$${i}`;
        nuevosParams.push(valor);
      }
      continue;
    }
    resultado += ch;
  }

  return { sql: resultado, params: nuevosParams };
}

/**
 * Emula la firma de mysql2/promise:
 *  - SELECT -> [filas]
 *  - INSERT/UPDATE/DELETE -> [header] con insertId / affectedRows / changedRows
 * Para los INSERT agrega RETURNING id (necesario para obtener insertId en pg).
 */
function crearConsulta(consultaNativaRef) {
  return async function consulta(sql, params = []) {
    const inicio = sql.trimStart().toUpperCase();
    const esInsert = inicio.startsWith('INSERT');

    let sqlFinal = sql;
    if (esInsert && !/RETURNING/i.test(sql)) {
      sqlFinal = `${sql} RETURNING id`;
    }

    const { sql: sqlPg, params: parametros } = convertirSQL(sqlFinal, params);
    const resultado = await consultaNativaRef(sqlPg, parametros);

    if (inicio.startsWith('SELECT')) {
      return [resultado.rows];
    }

    const header = {
      affectedRows: resultado.rowCount || 0,
      changedRows: resultado.rowCount || 0,
      insertId: 0,
    };
    if (esInsert && resultado.rows && resultado.rows.length && resultado.rows[0] && resultado.rows[0].id != null) {
      header.insertId = Number(resultado.rows[0].id);
    }
    return [header];
  };
}

pool.query = crearConsulta(consultaNativa);

/** Transacciones: imita pool.getConnection() + connection.beginTransaction() de mysql2 */
pool.getConnection = async function getConnection() {
  const cliente = await pool.connect();
  const consultaCliente = crearConsulta(cliente.query.bind(cliente));
  return {
    query: consultaCliente,
    beginTransaction: () => cliente.query('BEGIN'),
    commit: () => cliente.query('COMMIT'),
    rollback: () => cliente.query('ROLLBACK'),
    release: () => cliente.release(),
  };
};

async function probarConexion() {
  await pool.query('SELECT 1');
  return true;
}

module.exports = { pool, probarConexion };
