/**
 * Cliente HTTP del frontend para comunicarse con la API (misma origen).
 * La sesión viaja en una cookie httpOnly: no se envía ningún token desde JS.
 */

async function api(method, url, body) {
  const opciones = {
    method,
    credentials: 'same-origin',
  };
  if (body !== undefined) {
    opciones.headers = { 'Content-Type': 'application/json' };
    opciones.body = JSON.stringify(body);
  }

  let respuesta;
  try {
    respuesta = await fetch(url, opciones);
  } catch {
    throw new Error('No se pudo conectar con el servidor. Inténtalo nuevamente.');
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    const mensaje = (datos && datos.error && datos.error.mensaje) || 'No se pudo completar la operación. Inténtalo nuevamente.';
    const error = new Error(mensaje);
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}

const apiGet = (url) => api('GET', url);
const apiPost = (url, body) => api('POST', url, body);
const apiPut = (url, body) => api('PUT', url, body);
const apiPatch = (url, body) => api('PATCH', url, body);
const apiDelete = (url) => api('DELETE', url);

/* ------------------------- UI helpers ------------------------- */

let toastTimer = null;

function toast(mensaje, tipo) {
  let contenedor = document.getElementById('contenedor-toasts');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'contenedor-toasts';
    contenedor.setAttribute('aria-live', 'polite');
    document.body.appendChild(contenedor);
  }
  const el = document.createElement('div');
  el.className = 'toast toast-' + (tipo || 'info');
  el.textContent = mensaje;
  contenedor.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    el.classList.add('salida');
    setTimeout(function () { el.remove(); }, 300);
  }, 3500);
}

function mostrarError(mensaje) {
  toast(mensaje, 'error');
}

function mostrarExito(mensaje) {
  toast(mensaje, 'exito');
}

function confirmarAccion(mensaje) {
  return window.confirm(mensaje);
}

function manejarError401(error) {
  if (error && error.status === 401) {
    try { localStorage.removeItem('busEmpresa_sesion'); } catch (e) { /* noop */ }
    return true;
  }
  return false;
}
