const SESION_KEY = "busEmpresa_sesion";

function esPersonal(correo) {
  return correo.toLowerCase().endsWith("@personal.pe");
}

function rutaPagina(seccion, archivo) {
  return window.location.pathname.includes("/pages/")
    ? "../" + seccion + "/" + archivo
    : "pages/" + seccion + "/" + archivo;
}

function rutaPersonal() {
  return rutaPagina("personal", "personal.html");
}

function rutaAdmin() {
  return rutaPagina("administrador", "admin.html");
}

function rutaLogin() {
  return rutaPagina("cliente", "login.html");
}

function rutaCuenta() {
  return rutaPagina("cliente", "cuenta.html");
}

function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(SESION_KEY)) || null;
  } catch {
    return null;
  }
}

function guardarSesion(usuario) {
  localStorage.setItem(SESION_KEY, JSON.stringify(usuario));
}

function limpiarSesion() {
  localStorage.removeItem(SESION_KEY);
}

function usuarioAutenticado() {
  return obtenerSesion() !== null;
}

/** Valida la sesión contra la API y actualiza la caché local. Devuelve el usuario o null. */
async function verificarSesion() {
  try {
    const datos = await apiGet('/api/auth/me');
    guardarSesion(datos.usuario);
    return datos.usuario;
  } catch (error) {
    if (error && error.status === 401) limpiarSesion();
    return null;
  }
}

/** Cierra la sesión en el servidor (borra la cookie httpOnly) y redirige a login. */
async function cerrarSesion() {
  try {
    await apiPost('/api/auth/logout');
  } catch (error) {
    // se limpia igualmente aunque el servidor falle
  }
  limpiarSesion();
  window.location.href = rutaLogin();
}

/** Redirige según el rol: admin -> panel admin, personal -> panel personal, cliente -> cuenta. */
function redirigirPorRol(usuario) {
  if (usuario.rol === 'admin') return rutaAdmin();
  if (usuario.rol === 'personal') return rutaPersonal();
  return rutaCuenta();
}
