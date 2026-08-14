const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { badRequest, notFound } = require('../utils/httpError');
const { auditar, ipDe } = require('../utils/auditor');

function mapear(f) {
  return { id: f.id, nombre: f.nombre, rol: f.rol, telefono: f.telefono, dni: f.dni, anios: f.anios };
}

/** GET /api/equipo — conductores y azafatas */
const listar = asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM equipo ORDER BY rol, nombre');
  res.json({ equipo: filas.map(mapear) });
});

/** POST /api/equipo */
const crear = asyncHandler(async (req, res) => {
  const { nombre, rol, telefono, dni, anios } = req.body;
  if (!['conductor', 'azafata'].includes(rol)) throw badRequest('El rol debe ser conductor o azafata.');

  const [resultado] = await pool.query(
    'INSERT INTO equipo (nombre, rol, telefono, dni, anios) VALUES (?, ?, ?, ?, ?)',
    [nombre, rol, telefono || null, dni || null, anios || 0]
  );
  const [filas] = await pool.query('SELECT * FROM equipo WHERE id = ?', [resultado.insertId]);

  await auditar({ usuario: req.usuario, accion: `Registró al equipo "${nombre}"`, modulo: 'equipo', ip: ipDe(req) });
  res.status(201).json({ mensaje: 'Miembro del equipo registrado.', miembro: mapear(filas[0]) });
});

/** PUT /api/equipo/:id */
const actualizar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, rol, telefono, dni, anios } = req.body;

  const [filas] = await pool.query('SELECT * FROM equipo WHERE id = ?', [id]);
  if (!filas.length) throw notFound('El miembro del equipo no existe.');
  if (!['conductor', 'azafata'].includes(rol)) throw badRequest('El rol debe ser conductor o azafata.');

  await pool.query(
    'UPDATE equipo SET nombre = ?, rol = ?, telefono = ?, dni = ?, anios = ? WHERE id = ?',
    [nombre, rol, telefono || null, dni || null, anios || 0, id]
  );
  const [actualizado] = await pool.query('SELECT * FROM equipo WHERE id = ?', [id]);

  await auditar({ usuario: req.usuario, accion: `Actualizó a "${nombre}"`, modulo: 'equipo', ip: ipDe(req) });
  res.json({ mensaje: 'Miembro del equipo actualizado.', miembro: mapear(actualizado[0]) });
});

/** DELETE /api/equipo/:id */
const eliminar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await pool.query('SELECT nombre FROM equipo WHERE id = ?', [id]);
  if (!filas.length) throw notFound('El miembro del equipo no existe.');

  await pool.query('DELETE FROM equipo WHERE id = ?', [id]);
  await auditar({ usuario: req.usuario, accion: `Eliminó a "${filas[0].nombre}" del equipo`, modulo: 'equipo', ip: ipDe(req) });
  res.json({ mensaje: 'Miembro del equipo eliminado.' });
});

module.exports = { listar, crear, actualizar, eliminar };
