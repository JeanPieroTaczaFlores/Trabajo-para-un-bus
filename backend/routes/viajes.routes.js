const express = require('express');
const ctrl = require('../controllers/viajes.controller');

const router = express.Router();

router.get('/', ctrl.listarViajes);
router.get('/:id', ctrl.verViaje);

module.exports = router;
