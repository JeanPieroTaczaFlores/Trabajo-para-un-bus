require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'andesbus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: false,
  timezone: 'local',
  dateStrings: true,
  charset: 'utf8mb4',
});

async function probarConexion() {
  const conn = await pool.getConnection();
  conn.release();
  return true;
}

module.exports = { pool, probarConexion };
