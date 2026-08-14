const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const { autenticar, requireAuth } = require('../middleware/auth');
const { validar } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('nombre').trim().isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('correo').trim().isEmail().withMessage('Ingresa un correo válido.').toLowerCase(),
    body('telefono').optional({ values: 'falsy' }).trim().isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 dígitos.'),
    body('dni').optional({ values: 'falsy' }).trim().isLength({ min: 8, max: 8 }).withMessage('El DNI debe tener 8 dígitos.').isNumeric().withMessage('El DNI debe ser numérico.'),
    body('contrasena').isLength({ min: 6, max: 100 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  ],
  validar,
  ctrl.registrar
);

router.post(
  '/login',
  [
    body('correo').trim().isEmail().withMessage('Ingresa un correo válido.').toLowerCase(),
    body('contrasena').notEmpty().withMessage('Ingresa tu contraseña.'),
  ],
  validar,
  ctrl.iniciarSesion
);

router.post('/logout', ctrl.cerrarSesion);

router.get('/me', autenticar, requireAuth, ctrl.sesion);

router.post(
  '/forgot-password',
  [body('correo').trim().isEmail().withMessage('Ingresa un correo válido.').toLowerCase()],
  validar,
  ctrl.recuperarContrasena
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Falta el token de recuperación.'),
    body('contrasena').isLength({ min: 6, max: 100 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  ],
  validar,
  ctrl.restablecerContrasena
);

module.exports = router;
