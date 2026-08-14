require('dotenv').config();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { unauthorized, forbidden } = require('../utils/httpError');

const COOKIE = process.env.COOKIE_NAME || 'andesbus_token';

/** Lee el JWT de la cookie httpOnly y valida la firma. No consulta la BD. */
function verificarToken(req) {
  const token = req.cookies && req.cookies[COOKIE];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware de autenticacion: si hay cookie valida, carga req.usuario
 * desde la base de datos (siempre datos frescos). Nunca rechaza la peticion.
 */
async function autenticar(req, res, next) {
  const payload = verificarToken(req);
  if (!payload || !payload.id) {
    req.usuario = null;
    return next();
  }
  try {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, telefono, dni, rol, activo, creado_en FROM usuarios WHERE id = ?',
      [payload.id]
    );
    req.usuario = filas.length ? filas[0] : null;
  } catch {
    req.usuario = null;
  }
  next();
}

/** Exige un usuario autenticado y activo. */
function requireAuth(req, res, next) {
  if (!req.usuario) {
    return next(unauthorized('Debes iniciar sesión para realizar esta acción.'));
  }
  if (req.usuario.activo !== 1 && req.usuario.activo !== true) {
    return next(forbidden('Tu cuenta está desactivada. Contacta al administrador.'));
  }
  next();
}

/** Exige que el rol del usuario este en la lista permitida. */
function authorize(...roles) {
  return function (req, res, next) {
    if (!req.usuario) return next(unauthorized());
    if (!roles.includes(req.usuario.rol)) {
      return next(forbidden('No tienes permisos para acceder a este módulo.'));
    }
    next();
  };
}

/** Carga los permisos del usuario (según rol) para comprobaciones granulares. */
async function cargarPermisos(rol) {
  const [filas] = await pool.query(
    `SELECT p.codigo
       FROM rol_permisos rp
       JOIN permisos p ON p.id = rp.permiso_id
      WHERE rp.rol = ?`,
    [rol]
  );
  return filas.map((f) => f.codigo);
}

/** Exige que el usuario tenga al menos uno de los permisos indicados. */
function requirePermisos(...codigos) {
  return async function (req, res, next) {
    if (!req.usuario) return next(unauthorized());
    // El admin siempre tiene acceso total (permisos de administracion)
    if (req.usuario.rol === 'admin') return next();
    try {
      const permisos = await cargarPermisos(req.usuario.rol);
      const ok = codigos.some((c) => permisos.includes(c));
      if (!ok) return next(forbidden('No tienes permisos para esta acción.'));
      req.permisos = permisos;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { autenticar, requireAuth, authorize, requirePermisos, verificarToken, cargarPermisos, COOKIE };
