const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { badRequest, notFound } = require('../utils/httpError');
const { auditar, ipDe } = require('../utils/auditor');

/* ------------------------------------------------------------------ */
/* ESTADÍSTICAS DEL DASHBOARD                                         */
/* ------------------------------------------------------------------ */

const stats = asyncHandler(async (req, res) => {
  const [totales] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente') AS clientes,
      (SELECT COUNT(*) FROM usuarios WHERE rol = 'personal') AS personal,
      (SELECT COUNT(*) FROM usuarios WHERE rol = 'admin') AS admins,
      (SELECT COUNT(*) FROM usuarios) AS usuarios_total,
      (SELECT COUNT(*) FROM usuarios WHERE activo = 0) AS usuarios_inactivos,
      (SELECT COUNT(*) FROM reservas) AS reservas,
      (SELECT COUNT(*) FROM reservas WHERE estado = 'Pendiente de confirmación') AS pagos_pendientes,
      (SELECT COUNT(*) FROM vehiculos) AS vehiculos,
      (SELECT COUNT(*) FROM vehiculos WHERE estado = 'En ruta') AS vehiculos_en_ruta,
      (SELECT COUNT(*) FROM viajes WHERE activo = 1) AS viajes,
      (SELECT COALESCE(SUM(total), 0) FROM reservas WHERE estado <> 'Liberado') AS ingresos
  `);

  const [porRol] = await pool.query(`
    SELECT rol, COUNT(*) AS total FROM usuarios GROUP BY rol
  `);

  const [porEstadoVehiculo] = await pool.query(`
    SELECT estado, COUNT(*) AS total FROM vehiculos GROUP BY estado
  `);

  const [porMetodoPago] = await pool.query(`
    SELECT metodo_pago AS metodo, COUNT(*) AS total FROM reservas GROUP BY metodo_pago
  `);

  const [reservas7d] = await pool.query(`
    SELECT DATE(fecha_reserva) AS dia, COUNT(*) AS total
      FROM reservas
     WHERE fecha_reserva >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(fecha_reserva)
     ORDER BY dia
  `);

  const [actividad] = await pool.query(`
    SELECT l.id, l.usuario_nombre, l.accion, l.modulo, l.detalle, l.resultado, l.ip, l.creado_en
      FROM logs_actividad l
     ORDER BY l.id DESC
     LIMIT 10
  `);

  const t = totales[0];
  res.json({
    totales: {
      clientes: Number(t.clientes),
      personal: Number(t.personal),
      admins: Number(t.admins),
      usuarios: Number(t.usuarios_total),
      usuariosInactivos: Number(t.usuarios_inactivos),
      reservas: Number(t.reservas),
      pagosPendientes: Number(t.pagos_pendientes),
      vehiculos: Number(t.vehiculos),
      vehiculosEnRuta: Number(t.vehiculos_en_ruta),
      viajes: Number(t.viajes),
      ingresos: Number(t.ingresos),
    },
    porRol,
    porEstadoVehiculo,
    porMetodoPago,
    reservas7d,
    actividad,
  });
});

/* ------------------------------------------------------------------ */
/* GESTIÓN DE USUARIOS (CRUD)                                          */
/* ------------------------------------------------------------------ */

const listarUsuarios = asyncHandler(async (req, res) => {
  const { rol, busqueda } = req.query;

  let where = '1=1';
  const params = [];
  if (rol) {
    where += ' AND rol = ?';
    params.push(rol);
  }
  if (busqueda) {
    where += ' AND (nombre LIKE ? OR correo LIKE ? OR dni LIKE ?)';
    const patron = `%${busqueda}%`;
    params.push(patron, patron, patron);
  }

  const [filas] = await pool.query(
    `SELECT id, nombre, correo, telefono, dni, rol, activo, creado_en,
            (SELECT COUNT(*) FROM reservas r WHERE r.usuario_id = u.id) AS reservas
       FROM usuarios u
      WHERE ${where}
      ORDER BY id DESC
      LIMIT 300`,
    params
  );
  res.json({
    usuarios: filas.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      correo: f.correo,
      telefono: f.telefono,
      dni: f.dni,
      rol: f.rol,
      activo: !!f.activo,
      creado_en: f.creado_en,
      reservas: Number(f.reservas),
    })),
  });
});

const crearUsuario = asyncHandler(async (req, res) => {
  const { nombre, correo, telefono, dni, rol, contrasena } = req.body;
  if (!['cliente', 'personal', 'admin'].includes(rol)) throw badRequest('Rol inválido.');

  const [existe] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
  if (existe.length) throw badRequest('Ya existe un usuario con ese correo.');

  const hash = await bcrypt.hash(contrasena, 10);
  const [resultado] = await pool.query(
    `INSERT INTO usuarios (nombre, correo, telefono, dni, contrasena_hash, rol)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, correo, telefono || null, dni || null, hash, rol]
  );

  await auditar({ usuario: req.usuario, accion: `Creó el usuario "${nombre}"`, modulo: 'usuarios', ip: ipDe(req) });
  res.status(201).json({ mensaje: 'Usuario creado.', id: resultado.insertId });
});

const actualizarUsuario = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, telefono, dni, rol, activo, contrasena } = req.body;

  const [filas] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  if (!filas.length) throw notFound('El usuario no existe.');

  const esAdminUnico = filas[0].rol === 'admin' && rol !== 'admin' && (await contarAdmins()) <= 1;
  if (esAdminUnico) throw badRequest('No puedes quitar el rol de administrador al único admin del sistema.');

  let hash = filas[0].contrasena_hash;
  if (contrasena && contrasena.length >= 6) {
    hash = await bcrypt.hash(contrasena, 10);
  }

  await pool.query(
    `UPDATE usuarios SET nombre = ?, telefono = ?, dni = ?, rol = ?, activo = ?, contrasena_hash = ? WHERE id = ?`,
    [nombre, telefono || null, dni || null, rol, activo ? 1 : 0, hash, id]
  );

  await auditar({ usuario: req.usuario, accion: `Actualizó al usuario #${id}`, modulo: 'usuarios', ip: ipDe(req) });
  res.json({ mensaje: 'Usuario actualizado.' });
});

const eliminarUsuario = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const [filas] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  if (!filas.length) throw notFound('El usuario no existe.');
  if (filas[0].id === req.usuario.id) throw badRequest('No puedes desactivar tu propia cuenta.');

  const esAdminUnico = filas[0].rol === 'admin' && (await contarAdmins()) <= 1;
  if (esAdminUnico) throw badRequest('No puedes desactivar al único administrador.');

  await pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);
  await auditar({ usuario: req.usuario, accion: `Desactivó al usuario #${id}`, modulo: 'usuarios', ip: ipDe(req) });
  res.json({ mensaje: 'Usuario desactivado. Ya no puede iniciar sesión.' });
});

async function contarAdmins() {
  const [f] = await pool.query("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin' AND activo = 1");
  return Number(f[0].total);
}

/* ------------------------------------------------------------------ */
/* PERMISOS                                                           */
/* ------------------------------------------------------------------ */

const listarPermisos = asyncHandler(async (req, res) => {
  const [permisos] = await pool.query('SELECT * FROM permisos ORDER BY id');
  const [asignaciones] = await pool.query('SELECT rol, permiso_id FROM rol_permisos');

  const mapa = {};
  asignaciones.forEach((a) => {
    (mapa[a.permiso_id] = mapa[a.permiso_id] || []).push(a.rol);
  });

  res.json({
    permisos: permisos.map((p) => ({
      id: p.id,
      codigo: p.codigo,
      descripcion: p.descripcion,
      roles: mapa[p.id] || [],
    })),
    roles: ['cliente', 'personal', 'admin'],
  });
});

const actualizarPermiso = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { rol, activo } = req.body;
  if (!['cliente', 'personal', 'admin'].includes(rol)) throw badRequest('Rol inválido.');

  const [existe] = await pool.query('SELECT id FROM permisos WHERE id = ?', [id]);
  if (!existe.length) throw notFound('El permiso no existe.');

  if (activo) {
    await pool.query('INSERT IGNORE INTO rol_permisos (rol, permiso_id) VALUES (?, ?)', [rol, id]);
  } else {
    await pool.query('DELETE FROM rol_permisos WHERE rol = ? AND permiso_id = ?', [rol, id]);
  }

  await auditar({ usuario: req.usuario, accion: `Permiso #${id} → rol ${rol}: ${activo ? 'otorgado' : 'revocado'}`, modulo: 'permisos', ip: ipDe(req) });
  res.json({ mensaje: activo ? 'Permiso otorgado.' : 'Permiso revocado.' });
});

/* ------------------------------------------------------------------ */
/* LOGS DE AUDITORÍA                                                   */
/* ------------------------------------------------------------------ */

const listarLogs = asyncHandler(async (req, res) => {
  const { modulo, limite } = req.query;
  let where = '1=1';
  const params = [];
  if (modulo) {
    where += ' AND modulo = ?';
    params.push(modulo);
  }
  const max = Math.min(Number(limite) || 200, 1000);
  params.push(max);

  const [filas] = await pool.query(
    `SELECT id, usuario_id, usuario_nombre, accion, modulo, detalle, resultado, ip, creado_en
       FROM logs_actividad
      WHERE ${where}
      ORDER BY id DESC
      LIMIT ?`,
    params
  );
  res.json({ logs: filas });
});

module.exports = {
  stats,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  listarPermisos,
  actualizarPermiso,
  listarLogs,
};
