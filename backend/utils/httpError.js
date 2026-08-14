class HttpError extends Error {
  constructor(status, mensaje, codigo) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo || null;
  }
}

function notFound(msj) {
  return new HttpError(404, msj || 'Recurso no encontrado');
}

function badRequest(msj) {
  return new HttpError(400, msj || 'Solicitud inválida');
}

function unauthorized(msj) {
  return new HttpError(401, msj || 'No autenticado');
}

function forbidden(msj) {
  return new HttpError(403, msj || 'No tienes permisos para esta acción');
}

module.exports = { HttpError, notFound, badRequest, unauthorized, forbidden };
