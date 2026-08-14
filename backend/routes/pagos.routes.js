const express = require('express');
const ctrl = require('../controllers/pagos.controller');
const { requireAuth, requirePermisos } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermisos('pagos.confirmar'));

router.get('/pendientes', ctrl.pendientes);
router.post('/:id/confirmar', ctrl.confirmar);

module.exports = router;
