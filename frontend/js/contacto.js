document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("form-contacto");
  const alerta = document.getElementById("alerta");
  const nombreInput = document.getElementById("nombre");
  const correoInput = document.getElementById("correo");
  const mensajeInput = document.getElementById("mensaje");

  const errores = {
    nombre: document.getElementById("error-nombre"),
    correo: document.getElementById("error-correo"),
    mensaje: document.getElementById("error-mensaje")
  };

  function mostrarError(campo) {
    errores[campo].classList.add("visible");
    document.getElementById(campo).style.borderColor = "var(--rojo)";
  }

  function limpiar() {
    alerta.classList.remove("visible");
    Object.keys(errores).forEach(function (campo) {
      errores[campo].classList.remove("visible");
      document.getElementById(campo).style.borderColor = "";
    });
  }

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    limpiar();

    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const mensaje = mensajeInput.value.trim();

    let valido = true;
    if (!nombre) { mostrarError("nombre"); valido = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { mostrarError("correo"); valido = false; }
    if (mensaje.length < 10) { mostrarError("mensaje"); valido = false; }

    if (!valido) return;

    alerta.textContent = "¡Gracias " + nombre.split(" ")[0] + "! Recibimos tu mensaje y te responderemos pronto.";
    alerta.classList.add("visible");
    formulario.reset();
  });
});
