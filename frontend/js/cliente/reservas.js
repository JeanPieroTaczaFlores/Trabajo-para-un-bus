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

  const TOTAL_ASIENTOS = 64;
  const PISO1_MULTIPLICADOR = 1.5;
  const PISO1_ASIENTOS = 20;
  const PLAN_FAMILIAR_DESCUENTO = 0.10;

  let viaje = null;

  function pisoDe(numero) {
    return numero <= PISO1_ASIENTOS ? 1 : 2;
  }

  function precioAsiento(numero) {
    return numero <= PISO1_ASIENTOS ? viaje.precio * PISO1_MULTIPLICADOR : viaje.precio;
  }

  function mostrarSinViaje() {
    cajaReserva.innerHTML =
      '<h2>' + t("reservas.seleccionaTitulo") + '</h2>' +
      '<p class="subtitulo">' + t("reservas.seleccionaSub") + '</p>' +
      '<a href="rutas.html" class="btn btn-azul btn-bloque">' + t("reservas.verRutas") + '</a>';
  }

  function construirUI() {
    const PRECIO_PISO1 = viaje.precio * PISO1_MULTIPLICADOR;

    cajaReserva.classList.add("caja-ancha");
    cajaReserva.innerHTML =
      '<h2>' + viaje.origen + ' → ' + viaje.destino + '</h2>' +
      '<p class="subtitulo">' + t("reservas.salida") + ' ' + viaje.hora + ' · ' + t("reservas.duracion") + ' ' + viaje.duracion + '</p>' +
      '<div class="viaje-info">' + t("reservas.piso1") + PRECIO_PISO1.toFixed(2) + ' · ' + t("reservas.piso2") + viaje.precio.toFixed(2) + '</div>' +
      '<div class="servicios-bus">' +
        '<span class="servicio">🖥️ ' + t("reservas.svcPantalla") + '</span>' +
        '<span class="servicio">🔌 ' + t("reservas.svcCargador") + '</span>' +
        '<span class="servicio">📶 ' + t("reservas.svcWifi") + '</span>' +
        '<span class="servicio">❄️ ' + t("reservas.svcAire") + '</span>' +
        '<span class="servicio">🛋️ ' + t("reservas.svcReclinable") + '</span>' +
        '<span class="servicio">☕ ' + t("reservas.svcSnack") + '</span>' +
        '<span class="servicio">🧻 ' + t("reservas.svcBano") + '</span>' +
      '</div>' +
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
          '<div class="nota-aviso" id="nota-familia">' + t("reservas.familiaNota") + '</div>' +
        '</div>' +
        '<button type="submit" class="btn btn-primario btn-bloque" id="btn-confirmar">' + t("reservas.confirmar") + '</button>' +
        '<div class="ticket-info">' + t("reservas.ticket") + '</div>' +
      '</form>';

    const fechaInput = document.getElementById("fecha-viaje");
    const alerta = document.getElementById("alerta");
    const errorFecha = document.getElementById("error-fecha");
    const errorAsientos = document.getElementById("error-asientos");
    const errorPago = document.getElementById("error-pago");
    const total = document.getElementById("total");
    const datosTarjeta = document.getElementById("datos-tarjeta");
    const notaEfectivo = document.getElementById("nota-efectivo");
    const notaFamilia = document.getElementById("nota-familia");
    const botonConfirmar = document.getElementById("btn-confirmar");

    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    fechaInput.min = hoy.toISOString().split("T")[0];

    const asientos = {};
    const asientosSeleccionados = [];
    let pagoSeleccionado = "";
    let fechaActual = fechaInput.min;

    function planFamiliarActivo() {
      return asientosSeleccionados.length >= 6;
    }

    function actualizarTotal() {
      let suma = 0;
      asientosSeleccionados.forEach(function (numero) {
        suma += precioAsiento(numero);
      });
      if (planFamiliarActivo()) {
        suma = suma * (1 - PLAN_FAMILIAR_DESCUENTO);
      }
      total.textContent = "S/ " + suma.toFixed(2);
      notaFamilia.classList.toggle("visible", planFamiliarActivo());
    }

    function agregarAsiento(numero) {
      asientosSeleccionados.push(numero);
      asientos[numero].classList.add("seleccionado");
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

    function crearBotonAsiento(numero, ocupados) {
      const premium = pisoDe(numero) === 1;
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "asiento" + (premium ? " asiento-premium" : "");
      boton.innerHTML =
        '<span class="num">' + numero + '</span>' +
        '<span class="servicios-asiento">' + (premium ? "🖥️🔌" : "🔌") + '</span>';
      boton.title = premium
        ? "Asiento " + numero + " · Piso 1 · Pantalla individual, cargador USB, reclinable"
        : "Asiento " + numero + " · Piso 2 · Cargador USB, reclinable";

      if (ocupados[numero]) {
        boton.classList.add("ocupado");
        boton.disabled = true;
      } else {
        boton.addEventListener("click", function () {
          if (boton.classList.contains("seleccionado")) {
            quitarAsiento(numero);
          } else {
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

    function crearFilaConEscalera(numeros, ocupados) {
      const fila = document.createElement("div");
      fila.className = "fila";
      const escalera = document.createElement("div");
      escalera.className = "escalera-lateral";
      escalera.title = "Escaleras de subida al piso 2";
      fila.appendChild(escalera);
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

    function cargarOcupados(fecha) {
      return apiGet('/api/viajes/' + viaje.id + '?fecha=' + fecha)
        .then(function (datos) {
          const ocupados = {};
          (datos.asientosOcupados || []).forEach(function (asiento) {
            ocupados[asiento] = true;
          });
          return ocupados;
        });
    }

    function refrescarPlano() {
      asientosSeleccionados.forEach(quitarAsiento);
      cargarOcupados(fechaActual).then(dibujarPlano).catch(function () {
        dibujarPlano({});
      });
    }

    dibujarPlano({});
    refrescarPlano();

    fechaInput.addEventListener("change", function () {
      errorFecha.classList.remove("visible");
      fechaInput.style.borderColor = "";
      fechaActual = fechaInput.value;
      refrescarPlano();
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

    document.getElementById("form-reserva").addEventListener("submit", async function (e) {
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

      botonConfirmar.disabled = true;
      botonConfirmar.textContent = t("reservas.enviando") || "Reservando…";

      try {
        const asientosOrdenados = asientosSeleccionados.slice().sort(function (a, b) { return a - b; });
        const datos = await apiPost('/api/reservas', {
          viajeId: viaje.id,
          fecha: fecha,
          asientos: asientosOrdenados,
          metodoPago: pagoSeleccionado
        });

        const reserva = datos.reserva;
        const pendienteEfectivo = reserva.metodoPago === "efectivo";
        const planFamiliar = reserva.planFamiliar;

        let mensajeExito =
          t("reservas.confirmado") + " Asiento(s) " + asientosOrdenados.join(", ") + " · Total S/ " + Number(reserva.total).toFixed(2) + ".";

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

        refrescarPlano();
        botonConfirmar.textContent = t("reservas.confirmado");
      } catch (error) {
        if (manejarError401(error)) {
          window.location.href = rutaLogin();
          return;
        }
        alerta.textContent = error.message;
        alerta.classList.add("visible");
        botonConfirmar.disabled = false;
        botonConfirmar.textContent = t("reservas.confirmar");
      }
    });
  }

  (async function cargar() {
    try {
      const datos = await apiGet('/api/viajes/' + viajeId);
      viaje = datos.viaje;
      construirUI();
    } catch (error) {
      mostrarSinViaje();
    }
  })();
});
