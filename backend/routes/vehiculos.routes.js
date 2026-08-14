const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/vehiculos.controller');
const { requireAuth, requirePermisos } = require('../middleware/auth');
const { validar } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermisos('vehiculos.manage'));

router.get('/', ctrl.listar);
router.get('/:id/pasajeros', ctrl.pasajeros);

router.post(
  '/',
  [
    body('placa').trim().isLength({ min: 3, max: 10 }).withMessage('La placa debe tener entre 3 y 10 caracteres.'),
    body('tipo').trim().isLength({ min: 2, max: 40 }).withMessage('Ingresa el tipo de vehículo.'),
    body('sede').optional({ values: 'falsy' }).trim(),
  ],
  validar,
  ctrl.crear
);

router.put(
  '/:id',
  [
    body('viajeId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Viaje inválido.'),
    body('viajeFecha').optional({ values: 'falsy' }).isDate().withMessage('Fecha inválida.'),
    body('conductorId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Conductor inválido.'),
    body('azafataId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Azafata inválida.'),
    body('sede').optional({ values: 'falsy' }).trim(),
  ],
  validar,
  ctrl.actualizar
);

router.patch('/:id/estado', [body('accion').notEmpty().withMessage('Falta la acción de estado.')], validar, ctrl.cambiarEstado);

module.exports = router;
