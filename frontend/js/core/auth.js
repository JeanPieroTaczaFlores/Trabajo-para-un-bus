const USUARIOS_KEY = "busEmpresa_usuarios";
const SESION_KEY = "busEmpresa_sesion";

const PERSONAL_USUARIOS = [
  { nombre: "Carlos Ramírez", correo: "carlos@personal.pe", contrasena: "andes123", telefono: "999888777", dni: "70000001", rol: "personal" },
  { nombre: "María Torres", correo: "maria@personal.pe", contrasena: "andes123", telefono: "999888776", dni: "70000002", rol: "personal" },
  { nombre: "Jorge Gutiérrez", correo: "jorge@personal.pe", contrasena: "andes123", telefono: "999888775", dni: "70000003", rol: "personal" },
  { nombre: "Lucía Mendoza", correo: "lucia@personal.pe", contrasena: "andes123", telefono: "999888774", dni: "70000004", rol: "personal" },
  { nombre: "Andrés Huamán", correo: "andres@personal.pe", contrasena: "andes123", telefono: "999888773", dni: "70000005", rol: "personal" },
  { nombre: "Marco Rivera", correo: "marco@personal.pe", contrasena: "andes123", telefono: "999888772", dni: "70000006", rol: "personal" },
  { nombre: "Rosa Salazar", correo: "rosa@personal.pe", contrasena: "andes123", telefono: "999888771", dni: "70000007", rol: "personal" }
];

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
  return rutaPagina("cliente", "login.html");
}

function rutaCuenta() {
  return rutaPagina("cliente", "cuenta.html");
}

function cerrarSesion() {
  localStorage.removeItem(SESION_KEY);
  window.location.href = rutaLogin();
}

function usuarioAutenticado() {
  return obtenerSesion() !== null;
}
