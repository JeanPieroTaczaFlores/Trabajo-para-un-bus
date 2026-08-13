document.addEventListener("DOMContentLoaded", function () {
  const cajaReserva = document.getElementById("caja-reserva");

  if (!usuarioAutenticado()) {
    cajaReserva.innerHTML =
      '<h2>' + t("reservas.necesitaTitulo") + '</h2>' +
      '<p class="subtitulo">' + t("reservas.necesitaSub") + '</p>' +
      '<a href="login.html" class="btn btn-azul btn-bloque">' + t("nav.login") + '</a>' +
      '<a href="registro.html" class="btn btn-secundario btn-bloque mt-16">' + t("nav.registro") + '</a>';
    return;
  }

  const parametros = new URLSearchParams(window.location.search);
  const viajeId = parseInt(parametros.get("viaje"), 10);
  const viaje = VIAJES.find(function (v) { return v.id === viajeId; });

  if (!viaje) {
    cajaReserva.innerHTML =
      '<h2>' + t("reservas.seleccionaTitulo") + '</h2>' +
      '<p class="subtitulo">' + t("reservas.seleccionaSub") + '</p>' +
      '<a href="rutas.html" class="btn btn-azul btn-bloque">' + t("reservas.verRutas") + '</a>';
    return;
  }

  const TOTAL_ASIENTOS = 64;
  const PRECIO_PISO1 = viaje.precio * PISO1_MULTIPLICADOR;
  const PLAN_FAMILIAR_DESCUENTO = 0.10;

  function obtenerReservas() {
    try {
      return JSON.parse(localStorage.getItem(RESERVAS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function textoPasajeros(n) {
    return n === 1 ? t("reservas.pasajero1") : t("reservas.pasajeros", { n: n });
  }

  function opcionesPasajeros() {
    let opciones = "";
    for (let i = 1; i <= 8; i++) {
      opciones += '<option value="' + i + '">' + textoPasajeros(i) + '</option>';
    }
    return opciones;
  }

  cajaReserva.classList.add("caja-ancha");
  cajaReserva.innerHTML =
    '<h2>' + viaje.origen + ' → ' + viaje.destino + '</h2>' +
    '<p class="subtitulo">' + t("reservas.salida") + ' ' + viaje.hora + ' · ' + t("reservas.duracion") + ' ' + viaje.duracion + '</p>' +
    '<div class="viaje-info">' + t("reservas.piso1") + PRECIO_PISO1.toFixed(2) + ' · ' + t("reservas.piso2") + viaje.precio.toFixed(2) + '</div>' +
    '<div class="alert alert-error" id="alerta"></div>' +
    '<form id="form-reserva" novalidate>' +
      '<div class="form-grupo">' +
        '<label for="fecha-viaje">' + t("reservas.fechaLabel") + '</label>' +
        '<input type="date" id="fecha-viaje">' +
        '<div class="mensaje-error" id="error-fecha">' + t("reservas.errFecha") + '</div>' +
      '</div>' +
      '<div class="form-grupo">' +
        '<label>' + t("reservas.asientosLabel") + '</label>' +
        '<div class="plano-bus">' +
          '<div class="piso">' +
            '<div class="piso-titulo"><span>' + t("reservas.piso1Titulo") + '</span><span>' + t("reservas.asientos") + ' 1 - 20 · S/ ' + PRECIO_PISO1.toFixed(2) + '</span></div>' +
            '<div id="plano-piso1"></div>' +
          '</div>' +
          '<div class="piso">' +
            '<div class="piso-titulo"><span>' + t("reservas.piso2Titulo") + '</span><span>' + t("reservas.asientos") + ' 21 - ' + TOTAL_ASIENTOS + ' · S/ ' + viaje.precio.toFixed(2) + '</span></div>' +
            '<div id="plano-piso2"></div>' +
          '</div>' +
          '<div class="leyenda">' +
            '<span><span class="muestra-asiento"></span> ' + t("reservas.leyDisp") + '</span>' +
            '<span><span class="muestra-asiento seleccionada"></span> ' + t("reservas.leySel") + '</span>' +
            '<span><span class="muestra-asiento ocupada"></span> ' + t("reservas.leyOcup") + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="mensaje-error" id="error-asientos">' + t("reservas.errAsientos") + '</div>' +
      '</div>' +
      '<div class="form-grupo">' +
        '<label for="pasajeros">' + t("reservas.pasajerosLabel") + '</label>' +
        '<select id="pasajeros">' + opcionesPasajeros() + '</select>' +
        '<div class="nota-aviso" id="nota-familia">' + t("reservas.familiaNota") + '</div>' +
      '</div>' +
      '<div class="form-grupo">' +
        '<label>' + t("reservas.pagoLabel") + '</label>' +
        '<div class="metodos-pago">' +
          '<button type="button" class="metodo-item" data-pago="tarjeta">' +
            '<input type="radio" name="pago" value="tarjeta"><span>💳 ' + t("reservas.tarjeta") + '</span>' +
          '</button>' +
          '<button type="button" class="metodo-item" data-pago="yape">' +
            '<input type="radio" name="pago" value="yape"><span>📱 ' + t("reservas.yape") + '</span>' +
          '</button>' +
          '<button type="button" class="metodo-item" data-pago="transferencia">' +
            '<input type="radio" name="pago" value="transferencia"><span>🏦 ' + t("reservas.transferencia") + '</span>' +
          '</button>' +
          '<button type="button" class="metodo-item" data-pago="efectivo">' +
            '<input type="radio" name="pago" value="efectivo"><span>💵 ' + t("reservas.efectivo") + '</span>' +
          '</button>' +
        '</div>' +
        '<div class="datos-tarjeta" id="datos-tarjeta">' +
          '<div class="form-grupo">' +
            '<label for="num-tarjeta">' + t("reservas.numTarjeta") + '</label>' +
            '<input type="text" id="num-tarjeta" placeholder="0000 0000 0000 0000" inputmode="numeric" maxlength="19">' +
          '</div>' +
          '<div class="form-grupo">' +
            '<label for="titular-tarjeta">' + t("reservas.titular") + '</label>' +
            '<input type="text" id="titular-tarjeta" placeholder="...">' +
          '</div>' +
          '<div class="fila-tarjeta">' +
            '<div class="form-grupo">' +
              '<label for="venc-tarjeta">' + t("reservas.venc") + '</label>' +
              '<input type="text" id="venc-tarjeta" placeholder="MM/AA" maxlength="5">' +
            '</div>' +
            '<div class="form-grupo">' +
              '<label for="cvv-tarjeta">' + t("reservas.cvv") + '</label>' +
              '<input type="password" id="cvv-tarjeta" placeholder="123" maxlength="4" inputmode="numeric">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="nota-aviso" id="nota-efectivo">' + t("reservas.notaEfectivo") + '</div>' +
        '<div class="mensaje-error" id="error-pago">' + t("reservas.errPago") + '</div>' +
      '</div>' +
      '<div class="form-grupo">' +
        '<label>' + t("reservas.totalLabel") + '</label>' +
        '<div class="viaje-precio" id="total">S/ 0.00</div>' +
      '</div>' +
      '<button type="submit" class="btn btn-primario btn-bloque">' + t("reservas.confirmar") + '</button>' +
      '<div class="ticket-info">' + t("reservas.ticket") + '</div>' +
    '</form>';

  const fechaInput = document.getElementById("fecha-viaje");
  const alerta = document.getElementById("alerta");
  const errorFecha = document.getElementById("error-fecha");
  const errorAsientos = document.getElementById("error-asientos");
  const errorPago = document.getElementById("error-pago");
  const selectPasajeros = document.getElementById("pasajeros");
  const total = document.getElementById("total");
  const datosTarjeta = document.getElementById("datos-tarjeta");
  const notaEfectivo = document.getElementById("nota-efectivo");
  const notaFamilia = document.getElementById("nota-familia");

  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1);
  fechaInput.min = hoy.toISOString().split("T")[0];

  const asientos = {};
  const asientosSeleccionados = [];
  let pagoSeleccionado = "";

  function cantidadPasajeros() {
    return parseInt(selectPasajeros.value, 10);
  }

  function planFamiliarActivo() {
    return cantidadPasajeros() >= 6;
  }

  function actualizarTotal() {
    let suma = 0;
    asientosSeleccionados.forEach(function (numero) {
      suma += precioAsiento(viaje, numero);
    });
    if (planFamiliarActivo()) {
      suma = suma * (1 - PLAN_FAMILIAR_DESCUENTO);
    }
    total.textContent = "S/ " + suma.toFixed(2);
    notaFamilia.classList.toggle("visible", planFamiliarActivo());
  }

  function agregarAsiento(numero) {
    if (asientosSeleccionados.length >= cantidadPasajeros()) return;
    asientosSeleccionados.push(numero);
    asientos[numero].classList.add("seleccionado");
    asientos[numero].disabled = true;
    actualizarTotal();
  }

  function quitarAsiento(numero) {
    const indice = asientosSeleccionados.indexOf(numero);
    if (indice === -1) return;
    asientosSeleccionados.splice(indice, 1);
    asientos[numero].classList.remove("seleccionado");
    asientos[numero].disabled = false;
    actualizarTotal();
  }

  function ocupadosEnFecha() {
    const fecha = fechaInput.value;
    const ocupados = {};
    obtenerReservas().forEach(function (r) {
      if (r.viajeId === viaje.id && r.fecha === fecha && r.estado !== "Liberado") {
        (r.asiento || []).forEach(function (asiento) {
          ocupados[asiento] = true;
        });
      }
    });
    return ocupados;
  }

  function crearBotonAsiento(numero, ocupados) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "asiento";
    boton.textContent = numero;
    boton.title = "Asiento " + numero + " · Piso " + pisoDeAsiento(numero);

    if (ocupados[numero]) {
      boton.classList.add("ocupado");
      boton.disabled = true;
    } else {
      boton.addEventListener("click", function () {
        if (boton.classList.contains("seleccionado")) {
          quitarAsiento(numero);
        } else {
          if (asientosSeleccionados.length >= cantidadPasajeros()) {
            alerta.classList.remove("alert-exito");
            alerta.classList.add("alert-error");
            alerta.textContent = t("reservas.soloAsientos", { n: cantidadPasajeros() });
            alerta.classList.add("visible");
            return;
          }
          agregarAsiento(numero);
        }
      });
    }

    asientos[numero] = boton;
    return boton;
  }

  function crearFila(numeros, ocupados) {
    const fila = document.createElement("div");
    fila.className = "fila";
    numeros.forEach(function (numero, indice) {
      if (indice === 2) {
        const pasillo = document.createElement("div");
        pasillo.className = "pasillo";
        fila.appendChild(pasillo);
      }
      fila.appendChild(crearBotonAsiento(numero, ocupados));
    });
    return fila;
  }

  function crearEscaleraLateral() {
    const escalera = document.createElement("div");
    escalera.className = "escalera-lateral";
    escalera.innerHTML = "";
    escalera.title = "Escaleras de subida al piso 2";
    return escalera;
  }

  function crearFilaConEscalera(numeros, ocupados) {
    const fila = document.createElement("div");
    fila.className = "fila";
    fila.appendChild(crearEscaleraLateral());
    const pasillo = document.createElement("div");
    pasillo.className = "pasillo";
    fila.appendChild(pasillo);
    numeros.forEach(function (numero) {
      fila.appendChild(crearBotonAsiento(numero, ocupados));
    });
    return fila;
  }

  function dibujarPlano(ocupados) {
    const piso1 = document.getElementById("plano-piso1");
    const piso2 = document.getElementById("plano-piso2");
    piso1.innerHTML = "";
    piso2.innerHTML = "";

    let numero = 1;

    for (let fila = 1; fila <= 5; fila++) {
      piso1.appendChild(crearFila([numero, numero + 1, numero + 2, numero + 3], ocupados));
      numero += 4;
    }

    for (let fila = 1; fila <= 4; fila++) {
      piso2.appendChild(crearFila([numero, numero + 1, numero + 2, numero + 3], ocupados));
      numero += 4;
    }

    piso2.appendChild(crearFilaConEscalera([numero, numero + 1], ocupados));
    numero += 2;
    piso2.appendChild(crearFilaConEscalera([numero, numero + 1], ocupados));
    numero += 2;

    for (let fila = 1; fila <= 6; fila++) {
      piso2.appendChild(crearFila([numero, numero + 1, numero + 2, numero + 3], ocupados));
      numero += 4;
    }
  }

  dibujarPlano({});

  fechaInput.addEventListener("change", function () {
    errorFecha.classList.remove("visible");
    fechaInput.style.borderColor = "";
    asientosSeleccionados.forEach(quitarAsiento);
    dibujarPlano(ocupadosEnFecha());
  });

  selectPasajeros.addEventListener("change", function () {
    while (asientosSeleccionados.length > cantidadPasajeros()) {
      quitarAsiento(asientosSeleccionados[asientosSeleccionados.length - 1]);
    }
    if (asientosSeleccionados.length === cantidadPasajeros()) {
      alerta.classList.remove("visible");
    }
    actualizarTotal();
  });

  document.querySelectorAll(".metodo-item").forEach(function (item) {
    item.addEventListener("click", function () {
      document.querySelectorAll(".metodo-item").forEach(function (m) {
        m.classList.remove("seleccionado");
        m.querySelector("input").checked = false;
      });
      item.classList.add("seleccionado");
      item.querySelector("input").checked = true;
      pagoSeleccionado = item.getAttribute("data-pago");
      errorPago.classList.remove("visible");
      datosTarjeta.classList.toggle("visible", pagoSeleccionado === "tarjeta");
      notaEfectivo.classList.toggle("visible", pagoSeleccionado === "efectivo");
    });
  });

  function validarTarjeta() {
    const num = document.getElementById("num-tarjeta").value.replace(/\s/g, "");
    const titular = document.getElementById("titular-tarjeta").value.trim();
    const venc = document.getElementById("venc-tarjeta").value.trim();
    const cvv = document.getElementById("cvv-tarjeta").value.trim();
    return /^\d{16}$/.test(num) && titular.length >= 3 && /^\d{2}\/\d{2}$/.test(venc) && /^\d{3,4}$/.test(cvv);
  }

  document.getElementById("num-tarjeta").addEventListener("input", function () {
    let valor = this.value.replace(/\D/g, "").slice(0, 16);
    this.value = valor.replace(/(\d{4})(?=\d)/g, "$1 ");
  });

  document.getElementById("venc-tarjeta").addEventListener("input", function () {
    let valor = this.value.replace(/\D/g, "").slice(0, 4);
    this.value = valor.replace(/(\d{2})(?=\d)/g, "$1/");
  });

  document.getElementById("form-reserva").addEventListener("submit", function (e) {
    e.preventDefault();
    alerta.classList.remove("visible");
    errorFecha.classList.remove("visible");
    errorAsientos.classList.remove("visible");
    errorPago.classList.remove("visible");
    fechaInput.style.borderColor = "";

    const fecha = fechaInput.value;
    const hoyMs = new Date(hoy.toISOString().split("T")[0]).getTime();
    const fechaMs = new Date(fecha).getTime();

    let valido = true;

    if (!fecha || fechaMs < hoyMs) {
      errorFecha.classList.add("visible");
      fechaInput.style.borderColor = "var(--rojo)";
      valido = false;
    }

    if (asientosSeleccionados.length === 0) {
      errorAsientos.classList.add("visible");
      valido = false;
    }

    if (!pagoSeleccionado) {
      errorPago.classList.add("visible");
      valido = false;
    }

    if (pagoSeleccionado === "tarjeta" && !validarTarjeta()) {
      alerta.textContent = t("reservas.maxPago");
      alerta.classList.add("visible");
      valido = false;
    }

    if (!valido) return;

    const sesion = obtenerSesion();
    const cantidad = asientosSeleccionados.length;
    const asientosOrdenados = asientosSeleccionados.slice().sort(function (a, b) { return a - b; });
    let totalPagar = 0;
    asientosOrdenados.forEach(function (numero) {
      totalPagar += precioAsiento(viaje, numero);
    });
    const planFamiliar = planFamiliarActivo();
    const descuentoFamiliar = planFamiliar ? PLAN_FAMILIAR_DESCUENTO : 0;
    totalPagar = totalPagar * (1 - descuentoFamiliar);

    const pendienteEfectivo = pagoSeleccionado === "efectivo";

    const reserva = {
      id: Date.now(),
      correoUsuario: sesion.correo,
      viajeId: viaje.id,
      origen: viaje.origen,
      destino: viaje.destino,
      hora: viaje.hora,
      duracion: viaje.duracion,
      fecha: fecha,
      asiento: asientosOrdenados,
      pasajeros: cantidad,
      total: totalPagar,
      metodoPago: pagoSeleccionado,
      planFamiliar: planFamiliar,
      estado: pendienteEfectivo ? "Pendiente de confirmación" : "Confirmada",
      fechaReserva: new Date().toISOString()
    };

    const reservas = obtenerReservas();
    reservas.push(reserva);
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservas));

    let mensajeExito =
      t("reservas.confirmado") + " Asiento(s) " + asientosOrdenados.join(", ") + " · Total S/ " + totalPagar.toFixed(2) + ".";

    if (planFamiliar) {
      mensajeExito += '<div class="nota-aviso visible">' + t("reservas.familiaMsg") + '</div>';
    }

    mensajeExito += '<div class="ticket-info">' + t("reservas.ticketRec") + '</div>';

    if (pendienteEfectivo) {
      mensajeExito += '<div class="nota-aviso visible">' + t("reservas.efectivoRec") + '</div>';
    }

    alerta.classList.remove("alert-error");
    alerta.classList.add("alert-exito");
    alerta.innerHTML = mensajeExito;
    alerta.classList.add("visible");

    dibujarPlano(ocupadosEnFecha());
    e.target.querySelector("button").disabled = true;
  });
});
