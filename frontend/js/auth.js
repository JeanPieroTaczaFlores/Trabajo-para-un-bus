const USUARIOS_KEY = "busEmpresa_usuarios";
const SESION_KEY = "busEmpresa_sesion";

function obtenerUsuarios() {
  try {
    return JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
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

function rutaLogin() {
  return window.location.pathname.includes("/pages/")
    ? "login.html"
    : "pages/login.html";
}

function cerrarSesion() {
  localStorage.removeItem(SESION_KEY);
  window.location.href = rutaLogin();
}

function usuarioAutenticado() {
  return obtenerSesion() !== null;
}
