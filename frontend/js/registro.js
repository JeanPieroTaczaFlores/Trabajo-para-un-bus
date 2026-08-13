document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("form-registro");
  const alerta = document.getElementById("alerta");

  const nombreInput = document.getElementById("nombre");
  const correoInput = document.getElementById("correo");
  const telefonoInput = document.getElementById("telefono");
  const contrasenaInput = document.getElementById("contrasena");
  const confirmarInput = document.getElementById("confirmar");

  const campos = {
    nombre: { input: nombreInput, error: document.getElementById("error-nombre") },
    correo: { input: correoInput, error: document.getElementById("error-correo") },
    telefono: { input: telefonoInput, error: document.getElementById("error-telefono") },
    contrasena: { input: contrasenaInput, error: document.getElementById("error-contrasena") },
    confirmar: { input: confirmarInput, error: document.getElementById("error-confirmar") }
  };

  function mostrarError(nombre) {
    campos[nombre].error.classList.add("visible");
    campos[nombre].input.style.borderColor = "var(--rojo)";
  }

  function limpiarErrores() {
    alerta.classList.remove("visible");
    Object.keys(campos).forEach(function (nombre) {
      campos[nombre].error.classList.remove("visible");
      campos[nombre].input.style.borderColor = "";
    });
  }

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    limpiarErrores();

    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim().toLowerCase();
    const telefono = telefonoInput.value.trim();
    const contrasena = contrasenaInput.value;
    const confirmar = confirmarInput.value;

    let valido = true;

    if (nombre.split(" ").length < 2) {
      mostrarError("nombre");
      valido = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarError("correo");
      valido = false;
    }
    if (!/^\d{7,9}$/.test(telefono)) {
      mostrarError("telefono");
      valido = false;
    }
    if (contrasena.length < 6) {
      mostrarError("contrasena");
      valido = false;
    }
    if (confirmar !== contrasena) {
      mostrarError("confirmar");
      valido = false;
    }

    if (!valido) return;

    const usuarios = obtenerUsuarios();
    if (usuarios.some(function (u) { return u.correo === correo; })) {
      alerta.textContent = t("reg.existe");
      alerta.classList.add("visible");
      return;
    }

    const nuevoUsuario = {
      nombre: nombre,
      correo: correo,
      telefono: telefono,
      contrasena: contrasena
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);
    guardarSesion(nuevoUsuario);

    alerta.classList.remove("alert-error");
    alerta.classList.add("alert-exito");
    alerta.textContent = t("reg.exito");
    alerta.classList.add("visible");

    setTimeout(function () {
      window.location.href = "cuenta.html";
    }, 1500);
  });
});
