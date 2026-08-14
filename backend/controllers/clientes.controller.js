const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { badRequest, notFound } = require('../utils/httpError');
const { auditar, ipDe } = require('../utils/auditor');

function mapear(f) {
  return {
    id: f.id,
    nombre: f.nombre,
    correo: f.correo,
    telefono: f.telefono,
    dni: f.dni,
    rol: f.rol,
    activo: !!f.activo,
    creado_en: f.creado_en,
    reservas: f.total_reservas ? Number(f.total_reservas) : 0,
    total_gastado: f.total_gastado != null ? Number(f.total_gastado) : 0,
  };
}

/** GET /api/clientes?busqueda= — listado de clientes para personal/admin */
const listar = asyncHandler(async (req, res) => {
  const busqueda = (req.query.busqueda || '').trim();

  let where = "u.rol = 'cliente'";
  const params = [];
  if (busqueda) {
    where += ' AND (u.nombre LIKE ? OR u.correo LIKE ? OR u.dni LIKE ?)';
    const patron = `%${busqueda}%`;
    params.push(patron, patron, patron);
  }

  const [filas] = await pool.query(
    `SELECT u.*,
            (SELECT COUNT(*) FROM reservas r WHERE r.usuario_id = u.id) AS total_reservas,
            (SELECT COALESCE(SUM(r.total), 0) FROM reservas r WHERE r.usuario_id = u.id AND r.estado <> 'Liberado') AS total_gastado
       FROM usuarios u
      WHERE ${where}
      ORDER BY u.nombre
      LIMIT 200`,
    params
  );
  res.json({ clientes: filas.map(mapear) });
});

/** GET /api/clientes/:id — detalle con sus reservas */
const ver = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await pool.query(
    `SELECT id, nombre, correo, telefono, dni, rol, activo, creado_en FROM usuarios WHERE id = ? AND rol = 'cliente'`,
    [id]
  );
  if (!filas.length) throw notFound('El cliente no existe.');
  const cliente = filas[0];

  const [reservas] = await pool.query(
    `SELECT r.*, v.origen, v.destino, v.hora,
            (SELECT GROUP_CONCAT(ra.asiento ORDER BY ra.asiento SEPARATOR ',')
               FROM reserva_asientos ra WHERE ra.reserva_id = r.id) AS asientos
       FROM reservas r JOIN viajes v ON v.id = r.viaje_id
      WHERE r.usuario_id = ?
      ORDER BY r.fecha DESC, r.id DESC`,
    [id]
  );

  res.json({ cliente: mapear({ ...cliente, total_reservas: reservas.length }), reservas });
});

/** PUT /api/clientes/:id — actualiza datos de un cliente (personal con permiso) */
const actualizar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, telefono, dni } = req.body;

  const [filas] = await pool.query('SELECT nombre FROM usuarios WHERE id = ? AND rol = ?', [id, 'cliente']);
  if (!filas.length) throw notFound('El cliente no existe.');

  await pool.query('UPDATE usuarios SET nombre = ?, telefono = ?, dni = ? WHERE id = ?', [nombre, telefono || null, dni || null, id]);
  await auditar({ usuario: req.usuario, accion: `Actualizó al cliente #${id}`, modulo: 'clientes', ip: ipDe(req) });
  res.json({ mensaje: 'Cliente actualizado.' });
});

module.exports = { listar, ver, actualizar };
