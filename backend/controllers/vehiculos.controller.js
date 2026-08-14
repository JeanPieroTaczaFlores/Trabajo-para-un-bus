const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { badRequest, notFound } = require('../utils/httpError');
const { auditar, ipDe } = require('../utils/auditor');

const ESTADOS = ['En terminal', 'En ruta', 'Llegado', 'En mantenimiento'];
const SEDES = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Puno'];

function mapear(f) {
  return {
    id: f.id,
    placa: f.placa,
    tipo: f.tipo,
    estado: f.estado,
    sede: f.sede,
    viajeId: f.viaje_id,
    viajeFecha: f.viaje_fecha,
    conductor: f.conductor,
    conductorId: f.conductor_id,
    azafata: f.azafata,
    azafataId: f.azafata_id,
    viajeOrigen: f.v_origen,
    viajeDestino: f.v_destino,
    viajeHora: f.v_hora ? String(f.v_hora).substring(0, 5) : null,
  };
}

const SELECCION = `
  SELECT v.*, ej.nombre AS conductor, ez.nombre AS azafata,
         vj.origen AS v_origen, vj.destino AS v_destino, vj.hora AS v_hora
    FROM vehiculos v
    LEFT JOIN equipo ej ON ej.id = v.conductor_id
    LEFT JOIN equipo ez ON ez.id = v.azafata_id
    LEFT JOIN viajes vj ON vj.id = v.viaje_id`;

/** GET /api/vehiculos */
const listar = asyncHandler(async (req, res) => {
  const [filas] = await pool.query(`${SELECCION} ORDER BY v.id`);
  res.json({ vehiculos: filas.map(mapear) });
});

/** POST /api/vehiculos — registra un vehículo nuevo */
const crear = asyncHandler(async (req, res) => {
  const { placa, tipo, sede } = req.body;
  const placaNormalizada = String(placa).trim().toUpperCase();

  if (sede && !SEDES.includes(sede)) throw badRequest('Sede inválida.');
  const [existe] = await pool.query('SELECT id FROM vehiculos WHERE placa = ?', [placaNormalizada]);
  if (existe.length) throw badRequest('Ya existe un vehículo con esa placa.');

  const [resultado] = await pool.query(
    'INSERT INTO vehiculos (placa, tipo, estado, sede) VALUES (?, ?, ?, ?)',
    [placaNormalizada, tipo, 'En terminal', sede || 'Lima']
  );
  const [filas] = await pool.query(`${SELECCION} WHERE v.id = ?`, [resultado.insertId]);

  await auditar({ usuario: req.usuario, accion: `Registró el vehículo ${placaNormalizada}`, modulo: 'vehiculos', ip: ipDe(req) });
  res.status(201).json({ mensaje: 'Vehículo registrado.', vehiculo: mapear(filas[0]) });
});

/** PUT /api/vehiculos/:id — asigna viaje, fecha y tripulación (solo En terminal) */
const actualizar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { viajeId, viajeFecha, conductorId, azafataId, sede } = req.body;

  const [filas] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
  if (!filas.length) throw notFound('El vehículo no existe.');
  const vehiculo = filas[0];

  if (vehiculo.estado !== 'En terminal') {
    throw badRequest('Solo se puede asignar viaje y tripulación cuando el bus está en el terminal.');
  }
  if (sede && !SEDES.includes(sede)) throw badRequest('Sede inválida.');

  if (viajeId) {
    const [viajes] = await pool.query('SELECT * FROM viajes WHERE id = ?', [viajeId]);
    if (!viajes.length) throw notFound('El viaje no existe.');
    if (viajes[0].origen !== (sede || vehiculo.sede)) {
      throw badRequest(`El bus está en ${sede || vehiculo.sede} y solo puede tomar rutas que salgan de esa sede.`);
    }
  }

  await pool.query(
    'UPDATE vehiculos SET viaje_id = ?, viaje_fecha = ?, conductor_id = ?, azafata_id = ?, sede = ? WHERE id = ?',
    [viajeId || null, viajeFecha || null, conductorId || null, azafataId || null, sede || vehiculo.sede, id]
  );
  const [actualizado] = await pool.query(`${SELECCION} WHERE v.id = ?`, [id]);

  await auditar({ usuario: req.usuario, accion: `Actualizó el vehículo ${vehiculo.placa}`, modulo: 'vehiculos', ip: ipDe(req) });
  res.json({ mensaje: 'Vehículo actualizado.', vehiculo: mapear(actualizado[0]) });
});

/** PATCH /api/vehiculos/:id/estado — transiciones (salida, llegada, mantenimiento, terminal, traslado) */
const cambiarEstado = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { accion, sede } = req.body;

  const [filas] = await pool.query(`SELECT * FROM vehiculos WHERE id = ?`, [id]);
  if (!filas.length) throw notFound('El vehículo no existe.');
  const vehiculo = filas[0];

  let nuevoEstado = vehiculo.estado;
  let nuevaSede = vehiculo.sede;

  const [viaje] = vehiculo.viaje_id
    ? await pool.query('SELECT * FROM viajes WHERE id = ?', [vehiculo.viaje_id])
    : [[]];

  if (accion === 'salida') {
    if (vehiculo.estado !== 'En terminal') throw badRequest('El bus debe estar en el terminal para marcar salida.');
    if (viaje.length && viaje[0].origen !== vehiculo.sede) {
      throw badRequest(`El bus está en ${vehiculo.sede} y la ruta ${viaje[0].origen} → ${viaje[0].destino} sale desde ${viaje[0].origen}. Haz un traslado primero.`);
    }
    nuevoEstado = 'En ruta';
    await pool.query(
      `INSERT INTO bitacora (tipo, placa, conductor, origen, destino, estado, fecha, hora_salida)
       VALUES ('recorrido', ?, ?, ?, ?, 'En ruta', CURDATE(), CURTIME())`,
      [vehiculo.placa, vehiculo.conductor_id ? (await buscarNombre(vehiculo.conductor_id)) : null,
       viaje.length ? viaje[0].origen : vehiculo.sede, viaje.length ? viaje[0].destino : '']
    );
  } else if (accion === 'llegada') {
    if (vehiculo.estado !== 'En ruta') throw badRequest('El bus debe estar en ruta para marcar llegada.');
    nuevoEstado = 'Llegado';
    if (viaje.length) nuevaSede = viaje[0].destino;
    await pool.query(
      `UPDATE bitacora SET estado = 'Completado', hora_llegada = CURTIME()
        WHERE tipo = 'recorrido' AND placa = ? AND estado = 'En ruta'
        ORDER BY id DESC LIMIT 1`,
      [vehiculo.placa]
    );
  } else if (accion === 'mantenimiento') {
    if (vehiculo.estado !== 'En terminal') throw badRequest('Solo se puede enviar a mantenimiento desde el terminal.');
    nuevoEstado = 'En mantenimiento';
  } else if (accion === 'terminal') {
    if (!['Llegado', 'En mantenimiento'].includes(vehiculo.estado)) {
      throw badRequest('Solo se puede volver al terminal desde Llegado o En mantenimiento.');
    }
    nuevoEstado = 'En terminal';
  } else if (accion === 'traslado') {
    if (vehiculo.estado !== 'En terminal') throw badRequest('Solo se puede trasladar un bus en el terminal.');
    if (!sede || !SEDES.includes(sede)) throw badRequest('Selecciona una sede de destino válida.');
    if (sede === vehiculo.sede) throw badRequest('El bus ya está en esa sede.');
    nuevaSede = sede;
    if (viaje.length && viaje[0].origen !== sede) {
      await pool.query('UPDATE vehiculos SET viaje_id = NULL, viaje_fecha = NULL WHERE id = ?', [id]);
    }
    await pool.query(
      `INSERT INTO bitacora (tipo, placa, conductor, origen, destino, fecha)
       VALUES ('traslado', ?, ?, ?, ?, CURDATE())`,
      [vehiculo.placa, vehiculo.conductor_id ? (await buscarNombre(vehiculo.conductor_id)) : null, vehiculo.sede, sede]
    );
  } else {
    throw badRequest('Acción de estado inválida.');
  }

  await pool.query('UPDATE vehiculos SET estado = ?, sede = ? WHERE id = ?', [nuevoEstado, nuevaSede, id]);
  const [actualizado] = await pool.query(`${SELECCION} WHERE v.id = ?`, [id]);

  await auditar({ usuario: req.usuario, accion: `${vehiculo.placa}: ${accion}`, modulo: 'vehiculos', ip: ipDe(req) });
  res.json({ mensaje: `Vehículo actualizado (${nuevoEstado}).`, vehiculo: mapear(actualizado[0]) });
});

/** GET /api/vehiculos/:id/pasajeros — pasajeros a bordo según viaje y fecha del bus */
const pasajeros = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await pool.query(`SELECT * FROM vehiculos WHERE id = ?`, [id]);
  if (!filas.length) throw notFound('El vehículo no existe.');
  const vehiculo = filas[0];
  if (!vehiculo.viaje_id || !vehiculo.viaje_fecha) {
    return res.json({ viaje: null, pasajeros: [] });
  }

  const [reservas] = await pool.query(
    `SELECT r.id, r.fecha, r.estado, r.metodo_pago, r.pasajeros,
            u.nombre, u.correo, u.telefono,
            (SELECT GROUP_CONCAT(ra.asiento ORDER BY ra.asiento SEPARATOR ',')
               FROM reserva_asientos ra WHERE ra.reserva_id = r.id) AS asientos,
            (SELECT GROUP_CONCAT(ra.piso ORDER BY ra.asiento SEPARATOR ',')
               FROM reserva_asientos ra WHERE ra.reserva_id = r.id) AS pisos
       FROM reservas r
       JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.viaje_id = ? AND r.fecha = ? AND r.estado <> 'Liberado'
      ORDER BY r.id`,
    [vehiculo.viaje_id, vehiculo.viaje_fecha]
  );

  res.json({
    viaje: { id: vehiculo.viaje_id, fecha: vehiculo.viaje_fecha },
    pasajeros: reservas,
  });
});

async function buscarNombre(equipoId) {
  const [f] = await pool.query('SELECT nombre FROM equipo WHERE id = ?', [equipoId]);
  return f.length ? f[0].nombre : null;
}

module.exports = { listar, crear, actualizar, cambiarEstado, pasajeros, ESTADOS, SEDES };
