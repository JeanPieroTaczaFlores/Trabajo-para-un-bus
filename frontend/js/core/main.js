const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("abierto");
  });
}

const enlaceReserva = document.getElementById("enlace-reserva");

if (enlaceReserva) {
  enlaceReserva.addEventListener("click", function (e) {
    if (!usuarioAutenticado()) {
      e.preventDefault();
      window.location.href = rutaLogin();
    }
  });
}

crearElementosFlotantes();
aplicarIdioma();
aplicarSesionUI();

function aplicarSesionUI() {
  const enlaceLogin = document.getElementById("enlace-login");
  const enlaceSalir = document.getElementById("enlace-salir");
  const enlaceRegistro = document.getElementById("enlace-registro");
  const sesion = obtenerSesion();

  if (!sesion) return;

  if (enlaceLogin) {
    const partes = sesion.nombre.split(" ");
    const nombreCorto = partes[0];
    enlaceLogin.innerHTML =
      t("cuenta.hola") + ", " + nombreCorto.charAt(0).toUpperCase() + nombreCorto.slice(1);
    enlaceLogin.href = sesion.rol === "personal" ? rutaPersonal() : rutaCuenta();
    enlaceLogin.removeAttribute("data-i18n");
  }

  if (enlaceRegistro) {
    enlaceRegistro.style.display = "none";
  }

  if (enlaceSalir) {
    enlaceSalir.style.display = "inline-block";
    enlaceSalir.addEventListener("click", function (e) {
      e.preventDefault();
      cerrarSesion();
    });
  }
}

function crearElementosFlotantes() {
  const iconoWhatsApp =
    '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
    '</svg>';

  const contenedor = document.createElement("div");
  contenedor.className = "botones-flotantes";
  contenedor.innerHTML =
    '<div class="panel-accesibilidad" id="panel-acc">' +
      '<div class="panel-cabecera">' +
        '<h4 id="acc-titulo">♿ Accesibilidad</h4>' +
        '<button class="panel-cerrar" id="acc-cerrar" aria-label="Cerrar">×</button>' +
      '</div>' +
      '<div class="panel-lista">' +
        '<div class="panel-item">' +
          '<span class="opc-icono">🔤</span><span class="opc-texto" id="acc-tamano">Tamaño de letra</span>' +
          '<div class="control-tamano">' +
            '<button id="acc-menos" aria-label="Reducir letra">A−</button>' +
            '<button id="acc-mas" aria-label="Aumentar letra">A+</button>' +
          '</div>' +
        '</div>' +
        '<div class="panel-item">' +
          '<span class="opc-icono">🌙</span><span class="opc-texto" id="acc-noche-t">Modo noche</span>' +
          '<button type="button" class="interruptor" id="int-noche" role="switch" aria-checked="false"></button>' +
        '</div>' +
        '<div class="panel-item">' +
          '<span class="opc-icono">📖</span><span class="opc-texto" id="acc-mascara-t">Máscara de lectura</span>' +
          '<button type="button" class="interruptor" id="int-mascara" role="switch" aria-checked="false"></button>' +
        '</div>' +
        '<div class="panel-item">' +
          '<span class="opc-icono">🔆</span><span class="opc-texto" id="acc-contraste-t">Alto contraste</span>' +
          '<button type="button" class="interruptor" id="int-contraste" role="switch" aria-checked="false"></button>' +
        '</div>' +
        '<div class="panel-item">' +
          '<span class="opc-icono">↔️</span><span class="opc-texto" id="acc-espaciado-t">Espaciado de texto</span>' +
          '<button type="button" class="interruptor" id="int-espaciado" role="switch" aria-checked="false"></button>' +
        '</div>' +
        '<div class="panel-item">' +
          '<span class="opc-icono">📚</span><span class="opc-texto" id="acc-lectura-t">Modo lectura</span>' +
          '<button type="button" class="interruptor" id="int-lectura" role="switch" aria-checked="false"></button>' +
        '</div>' +
        '<div class="panel-item">' +
          '<span class="opc-icono">🔗</span><span class="opc-texto" id="acc-subrayar-t">Subrayar enlaces</span>' +
          '<button type="button" class="interruptor" id="int-subrayar" role="switch" aria-checked="false"></button>' +
        '</div>' +
        '<div class="panel-item">' +
          '<span class="opc-icono">⏸️</span><span class="opc-texto" id="acc-animaciones-t">Pausar animaciones</span>' +
          '<button type="button" class="interruptor" id="int-animaciones" role="switch" aria-checked="false"></button>' +
        '</div>' +
        '<div class="panel-item">' +
          '<span class="opc-icono">🗣️</span><span class="opc-texto" id="acc-voz-t">Lectura en voz alta</span>' +
          '<button type="button" class="interruptor" id="int-voz" role="switch" aria-checked="false"></button>' +
        '</div>' +
        '<div class="panel-item">' +
          '<span class="opc-icono">🌐</span><span class="opc-texto" id="acc-idioma-t">Idioma</span>' +
          '<div class="idioma-botones">' +
            '<button class="idioma-btn" id="idioma-es">ES</button>' +
            '<button class="idioma-btn" id="idioma-en">EN</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button class="btn btn-secundario btn-bloque" id="acc-reset">Restablecer</button>' +
    '</div>' +
    '<a class="btn-flotante btn-wsp" href="https://wa.me/51987654321?text=Hola%20Andesbus%2C%20quiero%20informaci%C3%B3n%20sobre%20sus%20viajes" target="_blank" rel="noopener" aria-label="WhatsApp">' + iconoWhatsApp + '</a>' +
    '<button class="btn-flotante btn-acc" id="btn-acc" aria-label="Accesibilidad">♿</button>';

  document.body.appendChild(contenedor);

  const mascara = document.createElement("div");
  mascara.className = "mascara-lectura";
  mascara.id = "mascara-lectura";
  document.body.appendChild(mascara);

  const panel = document.getElementById("panel-acc");
  const btnAcc = document.getElementById("btn-acc");
  const btnCerrar = document.getElementById("acc-cerrar");
  const btnReset = document.getElementById("acc-reset");
  const btnMas = document.getElementById("acc-mas");
  const btnMenos = document.getElementById("acc-menos");

  const interruptores = {
    noche: document.getElementById("int-noche"),
    mascara: document.getElementById("int-mascara"),
    contraste: document.getElementById("int-contraste"),
    espaciado: document.getElementById("int-espaciado"),
    lectura: document.getElementById("int-lectura"),
    subrayar: document.getElementById("int-subrayar"),
    animaciones: document.getElementById("int-animaciones"),
    voz: document.getElementById("int-voz")
  };

  const ACC_KEY = "busEmpresa_accesibilidad";
  let config;
  const configBase = {
    tamano: 100,
    noche: false,
    mascara: false,
    contraste: false,
    espaciado: false,
    lectura: false,
    subrayar: false,
    animaciones: false,
    voz: false
  };

  try {
    config = JSON.parse(localStorage.getItem(ACC_KEY)) || JSON.parse(JSON.stringify(configBase));
  } catch {
    config = JSON.parse(JSON.stringify(configBase));
  }

  function aplicarConfig() {
    document.documentElement.style.fontSize = config.tamano + "%";
    const body = document.body;
    body.classList.toggle("modo-noche", config.noche);
    body.classList.toggle("mascara-activa", config.mascara);
    body.classList.toggle("alto-contraste", config.contraste);
    body.classList.toggle("espaciado-texto", config.espaciado);
    body.classList.toggle("modo-lectura", config.lectura);
    body.classList.toggle("subrayar-enlaces", config.subrayar);
    body.classList.toggle("sin-animaciones", config.animaciones);

    Object.keys(interruptores).forEach(function (nombre) {
      const activo = !!config[nombre];
      interruptores[nombre].classList.toggle("on", activo);
      interruptores[nombre].setAttribute("aria-checked", activo ? "true" : "false");
    });

    document.getElementById("idioma-es").classList.toggle("activo", obtenerIdioma() === "es");
    document.getElementById("idioma-en").classList.toggle("activo", obtenerIdioma() === "en");

    localStorage.setItem(ACC_KEY, JSON.stringify(config));
  }

  function alternar(nombre) {
    config[nombre] = !config[nombre];
    aplicarConfig();
    if (nombre === "voz") {
      if (config.voz) {
        leerPagina();
      } else {
        window.speechSynthesis && window.speechSynthesis.cancel();
      }
    }
  }

  btnAcc.addEventListener("click", function (e) {
    e.stopPropagation();
    panel.classList.toggle("visible");
    if (panel.classList.contains("visible")) {
      aplicarIdiomaEnPanel();
    }
  });

  btnCerrar.addEventListener("click", function () {
    panel.classList.remove("visible");
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

  interruptores.noche.addEventListener("click", function () { alternar("noche"); });
  interruptores.mascara.addEventListener("click", function () { alternar("mascara"); });
  interruptores.contraste.addEventListener("click", function () { alternar("contraste"); });
  interruptores.espaciado.addEventListener("click", function () { alternar("espaciado"); });
  interruptores.lectura.addEventListener("click", function () { alternar("lectura"); });
  interruptores.subrayar.addEventListener("click", function () { alternar("subrayar"); });
  interruptores.animaciones.addEventListener("click", function () { alternar("animaciones"); });
  interruptores.voz.addEventListener("click", function () { alternar("voz"); });

  document.getElementById("idioma-es").addEventListener("click", function () {
    definirIdioma("es");
    window.location.reload();
  });

  document.getElementById("idioma-en").addEventListener("click", function () {
    definirIdioma("en");
    window.location.reload();
  });

  btnReset.addEventListener("click", function () {
    config = JSON.parse(JSON.stringify(configBase));
    aplicarConfig();
    window.speechSynthesis && window.speechSynthesis.cancel();
  });

  aplicarConfig();
  aplicarIdiomaEnPanel();

  let mascaraActiva = false;
  document.addEventListener("mousemove", function (e) {
    if (!config.mascara) return;
    mascara.style.top = (e.clientY - 90) + "px";
  });
}

function leerPagina() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const main = document.querySelector("main") || document.body;
  const texto = main.innerText.replace(/\s+/g, " ").trim();
  if (!texto) return;
  const enunciado = new SpeechSynthesisUtterance(texto.substring(0, 3000));
  enunciado.lang = obtenerIdioma() === "en" ? "en-US" : "es-PE";
  enunciado.rate = 0.95;
  window.speechSynthesis.speak(enunciado);
}

function aplicarIdiomaEnPanel() {
  document.getElementById("acc-titulo").textContent = "♿ " + t("acc.titulo");
  document.getElementById("acc-tamano").textContent = t("acc.tamano");
  document.getElementById("acc-noche-t").textContent = t("acc.noche");
  document.getElementById("acc-mascara-t").textContent = t("acc.mascara");
  document.getElementById("acc-contraste-t").textContent = t("acc.contraste");
  document.getElementById("acc-espaciado-t").textContent = t("acc.espaciado");
  document.getElementById("acc-lectura-t").textContent = t("acc.lectura");
  document.getElementById("acc-subrayar-t").textContent = t("acc.subrayar");
  document.getElementById("acc-animaciones-t").textContent = t("acc.animaciones");
  document.getElementById("acc-voz-t").textContent = t("acc.voz");
  document.getElementById("acc-idioma-t").textContent = t("acc.idioma");
  document.getElementById("acc-reset").textContent = t("acc.reset");
}
