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

function cerrarSesion() {
  localStorage.removeItem(SESION_KEY);
  window.location.href = "login.html";
}

function usuarioAutenticado() {
  return obtenerSesion() !== null;
}

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("abierto");
    });
  }

  const enlaceLogin = document.getElementById("enlace-login");
  const enlaceSalir = document.getElementById("enlace-salir");
  const enlaceReserva = document.getElementById("enlace-reserva");
  const sesion = obtenerSesion();

  if (sesion) {
    if (enlaceLogin) {
      const partes = sesion.nombre.split(" ");
      const nombreCorto = partes[0];
      enlaceLogin.innerHTML =
        "Hola, " + nombreCorto.charAt(0).toUpperCase() + nombreCorto.slice(1);
      enlaceLogin.href = "cuenta.html";
    }
    if (enlaceSalir) {
      enlaceSalir.style.display = "inline-block";
      enlaceSalir.addEventListener("click", function (e) {
        e.preventDefault();
        cerrarSesion();
      });
    }
  }

  if (enlaceReserva) {
    enlaceReserva.addEventListener("click", function (e) {
      if (!usuarioAutenticado()) {
        e.preventDefault();
        window.location.href = "login.html";
      }
    });
  }
});
