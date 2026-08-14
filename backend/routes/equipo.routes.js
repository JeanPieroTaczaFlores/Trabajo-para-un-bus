const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/equipo.controller');
const { requireAuth, requirePermisos } = require('../middleware/auth');
const { validar } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermisos('vehiculos.manage'));

router.get('/', ctrl.listar);

router.post(
  '/',
  [
    body('nombre').trim().isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('rol').isIn(['conductor', 'azafata']).withMessage('El rol debe ser conductor o azafata.'),
    body('telefono').optional({ values: 'falsy' }).trim().isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 dígitos.'),
    body('dni').optional({ values: 'falsy' }).trim().isLength({ min: 8, max: 8 }).withMessage('El DNI debe tener 8 dígitos.'),
    body('anios').optional({ values: 'falsy' }).isInt({ min: 0, max: 60 }).withMessage('Años de experiencia inválidos.'),
  ],
  validar,
  ctrl.crear
);

router.put(
  '/:id',
  [
    body('nombre').trim().isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('rol').isIn(['conductor', 'azafata']).withMessage('El rol debe ser conductor o azafata.'),
    body('telefono').optional({ values: 'falsy' }).trim().isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 dígitos.'),
    body('dni').optional({ values: 'falsy' }).trim().isLength({ min: 8, max: 8 }).withMessage('El DNI debe tener 8 dígitos.'),
    body('anios').optional({ values: 'falsy' }).isInt({ min: 0, max: 60 }).withMessage('Años de experiencia inválidos.'),
  ],
  validar,
  ctrl.actualizar
);

router.delete('/:id', ctrl.eliminar);

module.exports = router;
