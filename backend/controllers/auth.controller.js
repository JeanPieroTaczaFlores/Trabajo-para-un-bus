require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { badRequest, unauthorized, forbidden, notFound } = require('../utils/httpError');
const { auditar, ipDe } = require('../utils/auditor');
const { COOKIE } = require('../middleware/auth');

const ROLES_VALIDOS = ['cliente', 'personal', 'admin'];
const SALTOS = 10;

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function opcionesCookie() {
  const horas = Number(String(process.env.JWT_EXPIRES_IN || '8h').replace('h', '')) || 8;
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: horas * 60 * 60 * 1000,
    path: '/',
  };
}

function publico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    telefono: usuario.telefono,
    dni: usuario.dni,
    rol: usuario.rol,
    activo: usuario.activo,
    creado_en: usuario.creado_en,
  };
}

/** POST /api/auth/register — crea cuenta de cliente */
const registrar = asyncHandler(async (req, res) => {
  const { nombre, correo, telefono, dni, contrasena } = req.body;

  const [existe] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
  if (existe.length) {
    throw badRequest('Ya existe una cuenta con ese correo.');
  }

  const hash = await bcrypt.hash(contrasena, SALTOS);
  const [resultado] = await pool.query(
    `INSERT INTO usuarios (nombre, correo, telefono, dni, contrasena_hash, rol)
     VALUES (?, ?, ?, ?, ?, 'cliente')`,
    [nombre, correo, telefono || null, dni || null, hash]
  );

  const [filas] = await pool.query(
    'SELECT id, nombre, correo, telefono, dni, rol, activo, creado_en FROM usuarios WHERE id = ?',
    [resultado.insertId]
  );
  const usuario = filas[0];
  const token = firmarToken(usuario);
  res.cookie(COOKIE, token, opcionesCookie());

  await auditar({ usuario, accion: 'Se registró en la plataforma', modulo: 'auth', ip: ipDe(req) });
  res.status(201).json({ mensaje: 'Cuenta creada correctamente.', usuario: publico(usuario) });
});

/** POST /api/auth/login */
const iniciarSesion = asyncHandler(async (req, res) => {
  const { correo, contrasena } = req.body;

  const [filas] = await pool.query(
    'SELECT id, nombre, correo, telefono, dni, contrasena_hash, rol, activo, creado_en FROM usuarios WHERE correo = ?',
    [correo]
  );
  if (!filas.length) {
    throw unauthorized('Correo o contraseña incorrectos.');
  }

  const usuario = filas[0];
  const ok = await bcrypt.compare(contrasena, usuario.contrasena_hash);
  if (!ok) {
    await auditar({ usuario, accion: 'Intento de inicio de sesión fallido', modulo: 'auth', resultado: 'Error', ip: ipDe(req) });
    throw unauthorized('Correo o contraseña incorrectos.');
  }
  if (usuario.activo !== 1) {
    throw forbidden('Tu cuenta está desactivada. Contacta al administrador.');
  }

  const token = firmarToken(usuario);
  res.cookie(COOKIE, token, opcionesCookie());
  delete usuario.contrasena_hash;

  await auditar({ usuario, accion: 'Inició sesión', modulo: 'auth', ip: ipDe(req) });
  res.json({ mensaje: 'Sesión iniciada correctamente.', usuario: publico(usuario) });
});

/** POST /api/auth/logout — borra la cookie */
const cerrarSesion = (req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ mensaje: 'Sesión cerrada correctamente.' });
};

/** GET /api/auth/me — devuelve el usuario autenticado (o 401) */
const sesion = (req, res) => {
  if (!req.usuario) throw unauthorized();
  res.json({ usuario: publico(req.usuario) });
};

/** POST /api/auth/forgot-password — genera token de recuperacion (dev: se loguea) */
const recuperarContrasena = asyncHandler(async (req, res) => {
  const { correo } = req.body;

  const [filas] = await pool.query('SELECT id, nombre FROM usuarios WHERE correo = ?', [correo]);
  if (!filas.length) {
    // No revelar si el correo existe: misma respuesta siempre
    return res.json({ mensaje: 'Si el correo está registrado, recibirás las instrucciones.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const minutos = Number(process.env.RESET_TOKEN_MINUTOS || 30);

  await pool.query(
    `UPDATE usuarios SET reset_token = ?, reset_expiracion = NOW() + (? * INTERVAL '1 minute') WHERE id = ?`,
    [hash, minutos, filas[0].id]
  );

  const url = `${process.env.APP_BASE_URL || 'http://localhost:3001'}/pages/cliente/restablecer.html?token=${token}`;
  // En desarrollo no hay servidor de correo: se muestra en el log del backend.
  console.log(`[RECUPERACIÓN] Enlace para ${correo}: ${url}`);

  await auditar({ usuario: filas[0], accion: 'Solicitó recuperación de contraseña', modulo: 'auth', ip: ipDe(req) });
  res.json({ mensaje: 'Si el correo está registrado, recibirás las instrucciones.' });
});

/** POST /api/auth/reset-password — usa el token para definir nueva contrasena */
const restablecerContrasena = asyncHandler(async (req, res) => {
  const { token, contrasena } = req.body;
  const hash = crypto.createHash('sha256').update(String(token || '')).digest('hex');

  const [filas] = await pool.query(
    'SELECT id, nombre FROM usuarios WHERE reset_token = ? AND reset_expiracion > NOW()',
    [hash]
  );
  if (!filas.length) {
    throw badRequest('El enlace de recuperación es inválido o ya expiró.');
  }

  const nuevaHash = await bcrypt.hash(contrasena, SALTOS);
  await pool.query(
    'UPDATE usuarios SET contrasena_hash = ?, reset_token = NULL, reset_expiracion = NULL WHERE id = ?',
    [nuevaHash, filas[0].id]
  );

  await auditar({ usuario: filas[0], accion: 'Restableció su contraseña', modulo: 'auth', ip: ipDe(req) });
  res.json({ mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
});

/** Valida que un rol sea de los permitidos (para uso del admin) */
function validarRol(rol) {
  if (!ROLES_VALIDOS.includes(rol)) {
    throw badRequest('Rol inválido. Debe ser cliente, personal o admin.');
  }
}

module.exports = {
  registrar,
  iniciarSesion,
  cerrarSesion,
  sesion,
  recuperarContrasena,
  restablecerContrasena,
  firmarToken,
  opcionesCookie,
  publico,
  validarRol,
};
