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

  crearElementosFlotantes();
});

function crearElementosFlotantes() {
  const contenedor = document.createElement("div");
  contenedor.className = "botones-flotantes";
  contenedor.innerHTML =
    '<div class="panel-accesibilidad" id="panel-acc">' +
      '<h4>♿ Accesibilidad</h4>' +
      '<div class="opcion-acc">' +
        '<span>Tamaño de letra</span>' +
        '<div>' +
          '<button id="acc-menos" aria-label="Reducir letra">A−</button> ' +
          '<button id="acc-mas" aria-label="Aumentar letra">A+</button>' +
        '</div>' +
      '</div>' +
      '<div class="opcion-acc">' +
        '<span>Alto contraste</span>' +
        '<button id="acc-contraste">Activar</button>' +
      '</div>' +
      '<button class="btn btn-secundario btn-bloque" id="acc-reset">Restablecer</button>' +
    '</div>' +
    '<a class="btn-flotante btn-wsp" href="https://wa.me/51987654321?text=Hola%20TransR%C3%A1pido%2C%20quiero%20informaci%C3%B3n%20sobre%20sus%20viajes" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">💬</a>' +
    '<button class="btn-flotante btn-acc" id="btn-acc" aria-label="Opciones de accesibilidad">♿</button>';

  document.body.appendChild(contenedor);

  const panel = document.getElementById("panel-acc");
  const btnAcc = document.getElementById("btn-acc");
  const botonContraste = document.getElementById("acc-contraste");
  const btnMas = document.getElementById("acc-mas");
  const btnMenos = document.getElementById("acc-menos");
  const btnReset = document.getElementById("acc-reset");

  const ACC_KEY = "busEmpresa_accesibilidad";
  let config;
  try {
    config = JSON.parse(localStorage.getItem(ACC_KEY)) || { tamano: 100, contraste: false };
  } catch {
    config = { tamano: 100, contraste: false };
  }

  function aplicarConfig() {
    document.documentElement.style.fontSize = config.tamano + "%";
    document.body.classList.toggle("alto-contraste", config.contraste);
    botonContraste.textContent = config.contraste ? "Desactivar" : "Activar";
    localStorage.setItem(ACC_KEY, JSON.stringify(config));
  }

  btnAcc.addEventListener("click", function (e) {
    e.stopPropagation();
    panel.classList.toggle("visible");
  });

  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && e.target !== btnAcc) {
      panel.classList.remove("visible");
    }
  });

  btnMas.addEventListener("click", function () {
    if (config.tamano < 150) config.tamano += 12.5;
    aplicarConfig();
  });

  btnMenos.addEventListener("click", function () {
    if (config.tamano > 100) config.tamano -= 12.5;
    aplicarConfig();
  });

  botonContraste.addEventListener("click", function () {
    config.contraste = !config.contraste;
    aplicarConfig();
  });

  btnReset.addEventListener("click", function () {
    config = { tamano: 100, contraste: false };
    aplicarConfig();
  });

  aplicarConfig();
}
