document.addEventListener("DOMContentLoaded", function () {
  if (usuarioAutenticado()) {
    window.location.href = "cuenta.html";
    return;
  }

  const formulario = document.getElementById("form-login");
  const alerta = document.getElementById("alerta");
  const correoInput = document.getElementById("correo");
  const contrasenaInput = document.getElementById("contrasena");
  const errorCorreo = document.getElementById("error-correo");
  const errorContrasena = document.getElementById("error-contrasena");

  function limpiarErrores() {
    alerta.classList.remove("visible");
    errorCorreo.classList.remove("visible");
    errorContrasena.classList.remove("visible");
    correoInput.style.borderColor = "";
    contrasenaInput.style.borderColor = "";
  }

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    limpiarErrores();

    const correo = correoInput.value.trim().toLowerCase();
    const contrasena = contrasenaInput.value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errorCorreo.classList.add("visible");
      correoInput.style.borderColor = "var(--rojo)";
      return;
    }
    if (!contrasena) {
      errorContrasena.classList.add("visible");
      contrasenaInput.style.borderColor = "var(--rojo)";
      return;
    }

    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(function (u) {
      return u.correo === correo && u.contrasena === contrasena;
    });

    if (!usuario) {
      alerta.textContent = "Correo o contraseña incorrectos.";
      alerta.classList.add("visible");
      return;
    }

    guardarSesion(usuario);
    window.location.href = "cuenta.html";
  });
});
