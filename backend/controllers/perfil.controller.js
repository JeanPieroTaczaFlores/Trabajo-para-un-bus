const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { badRequest, unauthorized } = require('../utils/httpError');
const { auditar, ipDe } = require('../utils/auditor');
const { publico } = require('../controllers/auth.controller');

/** GET /api/perfil — datos del propio usuario */
const obtenerPerfil = asyncHandler(async (req, res) => {
  const [filas] = await pool.query(
    'SELECT id, nombre, correo, telefono, dni, rol, activo, creado_en FROM usuarios WHERE id = ?',
    [req.usuario.id]
  );
  if (!filas.length) throw unauthorized();
  res.json({ usuario: publico(filas[0]) });
});

/** PUT /api/perfil — actualiza nombre, telefono y dni del propio usuario */
const actualizarPerfil = asyncHandler(async (req, res) => {
  const { nombre, telefono, dni } = req.body;

  await pool.query(
    'UPDATE usuarios SET nombre = ?, telefono = ?, dni = ? WHERE id = ?',
    [nombre, telefono || null, dni || null, req.usuario.id]
  );

  const [filas] = await pool.query(
    'SELECT id, nombre, correo, telefono, dni, rol, activo, creado_en FROM usuarios WHERE id = ?',
    [req.usuario.id]
  );

  await auditar({ usuario: filas[0], accion: 'Actualizó su perfil', modulo: 'perfil', ip: ipDe(req) });
  res.json({ mensaje: 'Perfil actualizado.', usuario: publico(filas[0]) });
});

/** PUT /api/perfil/contrasena — cambia la contrasena del propio usuario */
const cambiarContrasena = asyncHandler(async (req, res) => {
  const { actual, nueva } = req.body;

  const [filas] = await pool.query('SELECT id, nombre, contrasena_hash FROM usuarios WHERE id = ?', [req.usuario.id]);
  if (!filas.length) throw unauthorized();

  const ok = await bcrypt.compare(actual, filas[0].contrasena_hash);
  if (!ok) throw badRequest('La contraseña actual es incorrecta.');

  const hash = await bcrypt.hash(nueva, 10);
  await pool.query('UPDATE usuarios SET contrasena_hash = ? WHERE id = ?', [hash, req.usuario.id]);

  await auditar({ usuario: filas[0], accion: 'Cambió su contraseña', modulo: 'perfil', ip: ipDe(req) });
  res.json({ mensaje: 'Contraseña actualizada correctamente.' });
});

module.exports = { obtenerPerfil, actualizarPerfil, cambiarContrasena };
