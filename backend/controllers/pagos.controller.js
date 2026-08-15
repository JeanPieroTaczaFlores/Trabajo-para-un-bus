const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { badRequest, notFound } = require('../utils/httpError');
const { auditar, ipDe } = require('../utils/auditor');

/** GET /api/pagos/pendientes — reservas con pago en efectivo sin confirmar */
const pendientes = asyncHandler(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT p.id AS pago_id, p.monto, p.metodo,
            r.id AS reserva_id, r.fecha, r.estado,
            v.origen, v.destino, v.hora,
            u.nombre AS cliente, u.correo, u.telefono,
            (SELECT string_agg(ra.asiento::text, ',' ORDER BY ra.asiento)
               FROM reserva_asientos ra WHERE ra.reserva_id = r.id) AS asientos
       FROM pagos p
       JOIN reservas r ON r.id = p.reserva_id
       JOIN viajes v ON v.id = r.viaje_id
       JOIN usuarios u ON u.id = r.usuario_id
      WHERE p.estado = 'Pendiente'
      ORDER BY r.fecha ASC, r.id ASC`
  );
  res.json({ pendientes: filas });
});

/** POST /api/pagos/:id/confirmar — confirma el pago (efectivo) */
const confirmar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const [filas] = await pool.query(
    `SELECT p.*, r.id AS reserva_id FROM pagos p JOIN reservas r ON r.id = p.reserva_id WHERE p.id = ?`,
    [id]
  );
  if (!filas.length) throw notFound('El pago no existe.');
  if (filas[0].estado === 'Confirmado') throw badRequest('El pago ya está confirmado.');

  await pool.query(
    `UPDATE pagos SET estado = 'Confirmado', confirmado_por = ? WHERE id = ?`,
    [req.usuario.id, id]
  );
  await pool.query(
    `UPDATE reservas SET estado = 'Confirmada', confirmado_por = ? WHERE id = ?`,
    [req.usuario.id, filas[0].reserva_id]
  );

  await auditar({
    usuario: req.usuario,
    accion: `Confirmó el pago de la reserva #${filas[0].reserva_id}`,
    modulo: 'pagos',
    ip: ipDe(req),
  });
  res.json({ mensaje: 'Pago confirmado. La reserva quedó Confirmada.' });
});

module.exports = { pendientes, confirmar };
