const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/reservas.controller');
const { requireAuth, requirePermisos } = require('../middleware/auth');
const { validar } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/mias', ctrl.misReservas);
router.get('/todas', requirePermisos('clients.view'), ctrl.todas);

router.post(
  '/',
  [
    body('viajeId').isInt({ min: 1 }).withMessage('Selecciona un viaje válido.'),
    body('fecha').isDate().withMessage('Ingresa una fecha válida.'),
    body('asientos').isArray({ min: 1 }).withMessage('Selecciona al menos un asiento.'),
    body('metodoPago').isIn(['tarjeta', 'yape', 'transferencia', 'efectivo']).withMessage('Método de pago inválido.'),
  ],
  validar,
  ctrl.crearReserva
);

router.delete('/:id', ctrl.cancelarReserva);

module.exports = router;
