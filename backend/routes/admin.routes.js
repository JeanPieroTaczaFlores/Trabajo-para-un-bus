const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/admin.controller');
const { requireAuth, authorize, requirePermisos } = require('../middleware/auth');
const { validar } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);
router.use(authorize('admin'));

// Dashboard y reportes
router.get('/stats', ctrl.stats);

// Gestión de usuarios (CRUD)
router.get('/usuarios', ctrl.listarUsuarios);

router.post(
  '/usuarios',
  [
    body('nombre').trim().isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('correo').trim().isEmail().withMessage('Ingresa un correo válido.').toLowerCase(),
    body('rol').isIn(['cliente', 'personal', 'admin']).withMessage('Rol inválido.'),
    body('contrasena').isLength({ min: 6, max: 100 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  ],
  validar,
  ctrl.crearUsuario
);

router.put(
  '/usuarios/:id',
  [
    body('nombre').trim().isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('rol').isIn(['cliente', 'personal', 'admin']).withMessage('Rol inválido.'),
    body('contrasena').optional({ values: 'falsy' }).isLength({ min: 6, max: 100 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  ],
  validar,
  ctrl.actualizarUsuario
);

router.delete('/usuarios/:id', ctrl.eliminarUsuario);

// Permisos granulares
router.get('/permisos', ctrl.listarPermisos);
router.put(
  '/permisos/:id',
  [body('rol').isIn(['cliente', 'personal', 'admin']).withMessage('Rol inválido.'), body('activo').isBoolean().withMessage('Indica si el permiso está activo.')],
  validar,
  ctrl.actualizarPermiso
);

// Auditoría
router.get('/logs', ctrl.listarLogs);

module.exports = router;
