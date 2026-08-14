const { HttpError } = require('../utils/httpError');

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  // Errores de express-validator que llegaron sin mapear
  if (err && err.array && typeof err.array === 'function') {
    const primero = err.array({ onlyFirstError: true })[0];
    err = new HttpError(400, primero.msg);
  }

  const status = err instanceof HttpError ? err.status : 500;

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ->`, err);
  } else {
    console.warn(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${status}: ${err.message}`);
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(status).json({
    error: {
      mensaje: status >= 500 ? 'No se pudo completar la operación. Inténtalo nuevamente.' : err.message,
      codigo: err.codigo || (status >= 500 ? 'internal' : 'error'),
    },
  });
}

module.exports = { errorHandler };
