const USUARIOS_KEY = "busEmpresa_usuarios";
const SESION_KEY = "busEmpresa_sesion";

const PERSONAL_USUARIOS = [
  { nombre: "Carlos Ramírez", correo: "carlos@personal.pe", contrasena: "andes123", telefono: "999888777", dni: "70000001", rol: "personal" },
  { nombre: "María Torres", correo: "maria@personal.pe", contrasena: "andes123", telefono: "999888776", dni: "70000002", rol: "personal" }
];

function esPersonal(correo) {
  return correo.toLowerCase().endsWith("@personal.pe");
}

function rutaPersonal() {
  return window.location.pathname.includes("/pages/")
    ? "personal.html"
    : "pages/personal.html";
}

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
