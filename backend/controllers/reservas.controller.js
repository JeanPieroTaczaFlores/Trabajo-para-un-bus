const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { badRequest, notFound, forbidden } = require('../utils/httpError');
const { auditar, ipDe } = require('../utils/auditor');

const TOTAL_ASIENTOS = 64;
const PISO1_ASIENTOS = 20;
const PISO1_MULTIPLICADOR = 1.5;
const PLAN_FAMILIAR_DESCUENTO = 0.10;
const PISO1_ASIENTOS_FAMILIA = 6;

function pisoDe(numero) {
  return numero <= PISO1_ASIENTOS ? 1 : 2;
}

function precioAsiento(viaje, numero) {
  const precio = Number(viaje.precio);
  return numero <= PISO1_ASIENTOS ? precio * PISO1_MULTIPLICADOR : precio;
}

function mapearReserva(f) {
  return {
    id: f.id,
    viajeId: f.viaje_id,
    origen: f.origen,
    destino: f.destino,
    hora: f.hora ? String(f.hora).substring(0, 5) : null,
    fecha: f.fecha,
    pasajeros: f.pasajeros,
    asientos: f.asientos ? f.asientos.split(',').map(Number) : [],
    total: Number(f.total),
    metodoPago: f.metodo_pago,
    estado: f.estado,
    planFamiliar: !!f.plan_familiar,
    fechaReserva: f.fecha_reserva,
  };
}

/** GET /api/reservas/mias — reservas del usuario autenticado */
const misReservas = asyncHandler(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT r.*, v.origen, v.destino, v.hora,
            (SELECT GROUP_CONCAT(ra.asiento ORDER BY ra.asiento SEPARATOR ',')
               FROM reserva_asientos ra WHERE ra.reserva_id = r.id) AS asientos
       FROM reservas r
       JOIN viajes v ON v.id = r.viaje_id
      WHERE r.usuario_id = ?
      ORDER BY r.fecha DESC, r.id DESC`,
    [req.usuario.id]
  );
  res.json({ reservas: filas.map(mapearReserva) });
});

/** GET /api/reservas/todas — todas las reservas con datos del cliente (personal/admin) */
const todas = asyncHandler(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT r.*, v.origen, v.destino, v.hora, u.nombre AS cliente, u.correo AS correo_cliente,
            (SELECT GROUP_CONCAT(ra.asiento ORDER BY ra.asiento SEPARATOR ',')
               FROM reserva_asientos ra WHERE ra.reserva_id = r.id) AS asientos
       FROM reservas r
       JOIN viajes v ON v.id = r.viaje_id
       JOIN usuarios u ON u.id = r.usuario_id
      ORDER BY r.fecha DESC, r.id DESC`
  );
  res.json({
    reservas: filas.map(function (f) {
      return Object.assign(mapearReserva(f), {
        cliente: f.cliente,
        correoCliente: f.correo_cliente,
      });
    }),
  });
});

/** POST /api/reservas — crea una reserva (con bloqueo de asientos en transacción) */
const crearReserva = asyncHandler(async (req, res) => {
  const { viajeId, fecha, asientos, metodoPago } = req.body;

  const [viajes] = await pool.query('SELECT * FROM viajes WHERE id = ? AND activo = 1', [viajeId]);
  if (!viajes.length) throw notFound('El viaje seleccionado no existe.');

  const viaje = viajes[0];
  const numeros = [...new Set((asientos || []).map(Number).filter((n) => Number.isInteger(n)))];
  if (!numeros.length) throw badRequest('Selecciona al menos un asiento.');
  if (numeros.some((n) => n < 1 || n > TOTAL_ASIENTOS)) {
    throw badRequest(`Los asientos deben estar entre 1 y ${TOTAL_ASIENTOS}.`);
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [ocupados] = await conexion.query(
      `SELECT ra.asiento
         FROM reserva_asientos ra
         JOIN reservas r ON r.id = ra.reserva_id
        WHERE r.viaje_id = ? AND r.fecha = ? AND r.estado <> 'Liberado'
          AND ra.asiento IN (?)
        FOR UPDATE`,
      [viajeId, fecha, numeros]
    );
    if (ocupados.length) {
      throw badRequest(`Los asientos ${ocupados.map((o) => o.asiento).join(', ')} ya están ocupados.`);
    }

    const planFamiliar = numeros.length >= PISO1_ASIENTOS_FAMILIA ? 1 : 0;
    let total = numeros.reduce((acc, n) => acc + precioAsiento(viaje, n), 0);
    if (planFamiliar) total = total * (1 - PLAN_FAMILIAR_DESCUENTO);
    total = Math.round(total * 100) / 100;

    const confirmado = metodoPago !== 'efectivo';
    const estadoReserva = confirmado ? 'Confirmada' : 'Pendiente de confirmación';

    const [resultado] = await conexion.query(
      `INSERT INTO reservas (usuario_id, viaje_id, fecha, pasajeros, total, metodo_pago, estado, plan_familiar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.usuario.id, viajeId, fecha, numeros.length, total, metodoPago, estadoReserva, planFamiliar]
    );

    for (const n of numeros) {
      await conexion.query(
        'INSERT INTO reserva_asientos (reserva_id, asiento, piso) VALUES (?, ?, ?)',
        [resultado.insertId, n, pisoDe(n)]
      );
    }

    await conexion.query(
      'INSERT INTO pagos (reserva_id, metodo, monto, estado) VALUES (?, ?, ?, ?)',
      [resultado.insertId, metodoPago, total, confirmado ? 'Confirmado' : 'Pendiente']
    );

    await conexion.commit();

    const [filas] = await pool.query(
      `SELECT r.*, v.origen, v.destino, v.hora,
              (SELECT GROUP_CONCAT(ra.asiento ORDER BY ra.asiento SEPARATOR ',')
                 FROM reserva_asientos ra WHERE ra.reserva_id = r.id) AS asientos
         FROM reservas r JOIN viajes v ON v.id = r.viaje_id WHERE r.id = ?`,
      [resultado.insertId]
    );

    await auditar({
      usuario: req.usuario,
      accion: `Creó la reserva #${resultado.insertId}`,
      modulo: 'reservas',
      detalle: `${viaje.origen} → ${viaje.destino} · ${fecha}`,
      ip: ipDe(req),
    });

    res.status(201).json({ mensaje: 'Reserva creada correctamente.', reserva: mapearReserva(filas[0]) });
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
});

/** DELETE /api/reservas/:id — libera la reserva del propio usuario */
const cancelarReserva = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const [filas] = await pool.query('SELECT * FROM reservas WHERE id = ?', [id]);
  if (!filas.length) throw notFound('La reserva no existe.');
  const reserva = filas[0];
  if (reserva.usuario_id !== req.usuario.id) throw forbidden('Solo puedes cancelar tus propias reservas.');
  if (reserva.estado === 'Liberado') throw badRequest('La reserva ya está liberada.');

  await pool.query("UPDATE reservas SET estado = 'Liberado' WHERE id = ?", [id]);
  await pool.query("UPDATE pagos SET estado = 'Liberado' WHERE reserva_id = ?", [id]);

  await auditar({
    usuario: req.usuario,
    accion: `Canceló la reserva #${id}`,
    modulo: 'reservas',
    resultado: 'Correcto',
    ip: ipDe(req),
  });

  res.json({ mensaje: 'Reserva cancelada. Tus asientos quedaron liberados.' });
});

module.exports = { misReservas, todas, crearReserva, cancelarReserva };

