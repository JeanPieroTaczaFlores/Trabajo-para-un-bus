const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/perfil.controller');
const { requireAuth } = require('../middleware/auth');
const { validar } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', ctrl.obtenerPerfil);

router.put(
  '/',
  [
    body('nombre').trim().isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('telefono').optional({ values: 'falsy' }).trim().isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 dígitos.'),
    body('dni').optional({ values: 'falsy' }).trim().isLength({ min: 8, max: 8 }).withMessage('El DNI debe tener 8 dígitos.').isNumeric().withMessage('El DNI debe ser numérico.'),
  ],
  validar,
  ctrl.actualizarPerfil
);

router.put(
  '/contrasena',
  [
    body('actual').notEmpty().withMessage('Ingresa tu contraseña actual.'),
    body('nueva').isLength({ min: 6, max: 100 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres.'),
  ],
  validar,
  ctrl.cambiarContrasena
);

module.exports = router;
