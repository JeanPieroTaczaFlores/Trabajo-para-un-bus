const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { badRequest, notFound, forbidden } = require('../utils/httpError');
const { auditar, ipDe } = require('../utils/auditor');

function mapear(f) {
  return {
    id: f.id,
    origen: f.origen,
    destino: f.destino,
    hora: f.hora ? String(f.hora).substring(0, 5) : null,
    duracion: f.duracion,
    precio: Number(f.precio),
    fecha: f.fecha,
    personal_creado: !!f.personal_creado,
  };
}

/** POST /api/viajes — crea un viaje (personal o admin) */
const crear = asyncHandler(async (req, res) => {
  const { origen, destino, hora, duracion, precio, fecha } = req.body;

  const [resultado] = await pool.query(
    `INSERT INTO viajes (origen, destino, hora, duracion, precio, fecha, personal_creado, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    [origen, destino, hora, duracion, precio, fecha || null, req.usuario.id]
  );
  const [filas] = await pool.query('SELECT * FROM viajes WHERE id = ?', [resultado.insertId]);

  await auditar({ usuario: req.usuario, accion: `Creó el viaje ${origen} → ${destino}`, modulo: 'viajes', ip: ipDe(req) });
  res.status(201).json({ mensaje: 'Viaje creado. Ya aparece en Rutas y Horarios.', viaje: mapear(filas[0]) });
});

/** PUT /api/viajes/:id — edita un viaje creado por personal (o cualquier viaje si es admin) */
const actualizar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { origen, destino, hora, duracion, precio, fecha } = req.body;

  const [filas] = await pool.query('SELECT * FROM viajes WHERE id = ?', [id]);
  if (!filas.length) throw notFound('El viaje no existe.');
  if (!filas[0].personal_creado && req.usuario.rol !== 'admin') {
    throw forbidden('Solo puedes editar viajes creados por el personal.');
  }

  await pool.query(
    'UPDATE viajes SET origen = ?, destino = ?, hora = ?, duracion = ?, precio = ?, fecha = ? WHERE id = ?',
    [origen, destino, hora, duracion, precio, fecha || null, id]
  );
  const [actualizado] = await pool.query('SELECT * FROM viajes WHERE id = ?', [id]);
  await auditar({ usuario: req.usuario, accion: `Editó el viaje #${id}`, modulo: 'viajes', ip: ipDe(req) });
  res.json({ mensaje: 'Viaje actualizado.', viaje: mapear(actualizado[0]) });
});

/** DELETE /api/viajes/:id — elimina un viaje creado por personal (o cualquiera si es admin) */
const eliminar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await pool.query('SELECT * FROM viajes WHERE id = ?', [id]);
  if (!filas.length) throw notFound('El viaje no existe.');
  if (!filas[0].personal_creado && req.usuario.rol !== 'admin') {
    throw forbidden('Solo puedes eliminar viajes creados por el personal.');
  }

  await pool.query('UPDATE viajes SET activo = 0 WHERE id = ?', [id]);
  await auditar({ usuario: req.usuario, accion: `Eliminó el viaje #${id}`, modulo: 'viajes', ip: ipDe(req) });
  res.json({ mensaje: 'Viaje eliminado.' });
});

module.exports = { crear, actualizar, eliminar };
