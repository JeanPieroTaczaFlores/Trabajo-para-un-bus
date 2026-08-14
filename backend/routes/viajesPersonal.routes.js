const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/viajesPersonal.controller');
const { requireAuth, requirePermisos } = require('../middleware/auth');
const { validar } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermisos('viajes.manage'));

router.post(
  '/',
  [
    body('origen').trim().isLength({ min: 3, max: 60 }).withMessage('Ingresa la ciudad de origen.'),
    body('destino').trim().isLength({ min: 3, max: 60 }).withMessage('Ingresa la ciudad de destino.'),
    body('hora').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Ingresa una hora válida (HH:MM).'),
    body('duracion').trim().notEmpty().withMessage('Ingresa la duración del viaje.'),
    body('precio').isFloat({ min: 1, max: 10000 }).withMessage('Ingresa un precio válido.'),
    body('fecha').optional({ values: 'falsy' }).isDate().withMessage('Ingresa una fecha válida.'),
  ],
  validar,
  ctrl.crear
);

router.put(
  '/:id',
  [
    body('origen').trim().isLength({ min: 3, max: 60 }).withMessage('Ingresa la ciudad de origen.'),
    body('destino').trim().isLength({ min: 3, max: 60 }).withMessage('Ingresa la ciudad de destino.'),
    body('hora').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Ingresa una hora válida (HH:MM).'),
    body('duracion').trim().notEmpty().withMessage('Ingresa la duración del viaje.'),
    body('precio').isFloat({ min: 1, max: 10000 }).withMessage('Ingresa un precio válido.'),
    body('fecha').optional({ values: 'falsy' }).isDate().withMessage('Ingresa una fecha válida.'),
  ],
  validar,
  ctrl.actualizar
);

router.delete('/:id', ctrl.eliminar);

module.exports = router;
