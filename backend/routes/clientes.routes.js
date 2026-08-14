const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/clientes.controller');
const { requireAuth, requirePermisos } = require('../middleware/auth');
const { validar } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermisos('clients.view'));

router.get('/', ctrl.listar);
router.get('/:id', ctrl.ver);

router.put(
  '/:id',
  [
    body('nombre').trim().isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('telefono').optional({ values: 'falsy' }).trim().isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 dígitos.'),
    body('dni').optional({ values: 'falsy' }).trim().isLength({ min: 8, max: 8 }).withMessage('El DNI debe tener 8 dígitos.'),
  ],
  validar,
  ctrl.actualizar
);

module.exports = router;
