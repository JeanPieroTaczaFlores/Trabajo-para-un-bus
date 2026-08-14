document.addEventListener("DOMContentLoaded", function () {
  const sesionActiva = obtenerSesion();
  if (sesionActiva) {
    redirigirPorRol(sesionActiva);
    return;
  }

  const formulario = document.getElementById("form-login");
  const alerta = document.getElementById("alerta");
  const correoInput = document.getElementById("correo");
  const contrasenaInput = document.getElementById("contrasena");
  const botonEnviar = formulario.querySelector('button[type="submit"]');
  const errorCorreo = document.getElementById("error-correo");
  const errorContrasena = document.getElementById("error-contrasena");

  function limpiarErrores() {
    alerta.classList.remove("visible");
    errorCorreo.classList.remove("visible");
    errorContrasena.classList.remove("visible");
    correoInput.style.borderColor = "";
    contrasenaInput.style.borderColor = "";
  }

  formulario.addEventListener("submit", async function (e) {
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

    botonEnviar.disabled = true;
    botonEnviar.textContent = t("login.enviando") || "Ingresando…";

    try {
      const datos = await apiPost('/api/auth/login', { correo, contrasena });
      guardarSesion(datos.usuario);
      mostrarExito(datos.mensaje);
      setTimeout(function () {
        window.location.href = redirigirPorRol(datos.usuario);
      }, 400);
    } catch (error) {
      alerta.textContent = error.message;
      alerta.classList.add("visible");
      botonEnviar.disabled = false;
      botonEnviar.textContent = t("nav.login") || "Iniciar sesión";
    }
  });
});
