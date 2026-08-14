const { pool } = require('../config/db');

/**
 * Registra una operacion en la auditoria (logs_actividad).
 * @param {object} usuario  { id, nombre } del usuario autenticado (puede ser null)
 * @param {string} accion   Descripcion corta de la accion
 * @param {string} modulo   Modulo del sistema (auth, usuarios, reservas, ...)
 * @param {string|null} detalle Detalle adicional
 * @param {string} resultado 'Correcto' | 'Error'
 * @param {string} ip       Direccion IP del cliente
 */
async function auditar({ usuario, accion, modulo, detalle = null, resultado = 'Correcto', ip = null }) {
  try {
    await pool.query(
      `INSERT INTO logs_actividad (usuario_id, usuario_nombre, accion, modulo, detalle, resultado, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario ? usuario.id : null, usuario ? usuario.nombre : 'Sistema', accion, modulo, detalle, resultado, ip]
    );
  } catch (err) {
    // La auditoria nunca debe romper la operacion principal
    console.error('Error al registrar auditoría:', err.message);
  }
}

function ipDe(req) {
  return req.ip || req.socket && req.socket.remoteAddress || null;
}

module.exports = { auditar, ipDe };
