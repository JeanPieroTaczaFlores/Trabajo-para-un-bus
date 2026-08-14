const express = require('express');
const ctrl = require('../controllers/bitacora.controller');
const { requireAuth, requirePermisos } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermisos('bitacora.view'));

router.get('/', ctrl.listar);

module.exports = router;
