const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { notFound } = require('../utils/httpError');

function mapearViaje(f) {
  return {
    id: f.id,
    origen: f.origen,
    destino: f.destino,
    hora: typeof f.hora === 'string' ? f.hora.substring(0, 5) : String(f.hora).substring(0, 5),
    duracion: f.duracion,
    precio: Number(f.precio),
    fecha: f.fecha,
    personal_creado: !!f.personal_creado,
  };
}

/** GET /api/viajes?origen=&destino= — catálogo público de viajes */
const listarViajes = asyncHandler(async (req, res) => {
  const { origen, destino } = req.query;
  const condiciones = ['activo = 1'];
  const params = [];

  if (origen) {
    condiciones.push('origen = ?');
    params.push(origen);
  }
  if (destino) {
    condiciones.push('destino = ?');
    params.push(destino);
  }

  const [filas] = await pool.query(
    `SELECT * FROM viajes WHERE ${condiciones.join(' AND ')} ORDER BY origen, hora`,
    params
  );
  res.json({ viajes: filas.map(mapearViaje) });
});

/** GET /api/viajes/:id?fecha=YYYY-MM-DD — viaje + asientos ocupados para esa fecha */
const verViaje = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const [viajes] = await pool.query('SELECT * FROM viajes WHERE id = ? AND activo = 1', [id]);
  if (!viajes.length) throw notFound('El viaje no existe o ya no está disponible.');

  const viaje = viajes[0];
  const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

  const [asientos] = await pool.query(
    `SELECT ra.asiento
       FROM reserva_asientos ra
       JOIN reservas r ON r.id = ra.reserva_id
      WHERE r.viaje_id = ? AND r.fecha = ? AND r.estado <> 'Liberado'`,
    [id, fecha]
  );

  res.json({
    viaje: mapearViaje(viaje),
    fecha,
    asientosOcupados: asientos.map((a) => a.asiento),
  });
});

module.exports = { listarViajes, verViaje };
