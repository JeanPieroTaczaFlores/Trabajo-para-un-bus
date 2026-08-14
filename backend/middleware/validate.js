const { validationResult } = require('express-validator');
const { badRequest } = require('../utils/httpError');

/**
 * Middleware de validacion: ejecuta las reglas de express-validator que
 * esten montadas previamente en req (req.expressValidatorKeys) y devuelve
 * el primer error encontrado como 400.
 */
function validar(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const primero = errores.array({ onlyFirstError: true })[0];
    return next(badRequest(primero.msg));
  }
  next();
}

module.exports = { validar };
