const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');

/** GET /api/bitacora — recorridos y traslados, ordenados por fecha desc */
const listar = asyncHandler(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT id, tipo, placa, conductor, origen, destino, estado,
            fecha, hora_salida, hora_llegada
       FROM bitacora
      ORDER BY fecha DESC, id DESC
      LIMIT 500`
  );
  res.json({
    bitacora: filas.map((f) => ({
      id: f.id,
      tipo: f.tipo,
      placa: f.placa,
      conductor: f.conductor,
      origen: f.origen,
      destino: f.destino,
      estado: f.estado,
      fecha: f.fecha,
      horaSalida: f.hora_salida ? String(f.hora_salida).substring(0, 5) : null,
      horaLlegada: f.hora_llegada ? String(f.hora_llegada).substring(0, 5) : null,
    })),
  });
});

module.exports = { listar };
