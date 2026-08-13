document.addEventListener("DOMContentLoaded", function () {
  const cajaReserva = document.getElementById("caja-reserva");

  if (!usuarioAutenticado()) {
    cajaReserva.innerHTML =
      '<h2>Necesitas iniciar sesión</h2>' +
      '<p class="subtitulo">Para reservar tu viaje primero debes iniciar sesión o crear una cuenta.</p>' +
      '<a href="login.html" class="btn btn-azul btn-bloque">Iniciar sesión</a>' +
      '<a href="registro.html" class="btn btn-secundario btn-bloque mt-16">Crear cuenta</a>';
    return;
  }

  const parametros = new URLSearchParams(window.location.search);
  const viajeId = parseInt(parametros.get("viaje"), 10);
  const viaje = VIAJES.find(function (v) { return v.id === viajeId; });

  if (!viaje) {
    cajaReserva.innerHTML =
      '<h2>Selecciona un viaje</h2>' +
      '<p class="subtitulo">Primero elige tu ruta y horario en la sección de rutas.</p>' +
      '<a href="rutas.html" class="btn btn-azul btn-bloque">Ver rutas</a>';
    return;
  }

  function obtenerReservas() {
    try {
      return JSON.parse(localStorage.getItem(RESERVAS_KEY)) || [];
    } catch {
      return [];
    }
  }

  cajaReserva.classList.add("caja-ancha");
  cajaReserva.innerHTML =
    '<h2>' + viaje.origen + ' → ' + viaje.destino + '</h2>' +
    '<p class="subtitulo">Salida ' + viaje.hora + ' · Duración ' + viaje.duracion + ' · Precio por persona S/ ' + viaje.precio.toFixed(2) + '</p>' +
    '<div class="alert alert-error" id="alerta"></div>' +
    '<form id="form-reserva" novalidate>' +
      '<div class="form-grupo">' +
        '<label for="fecha-viaje">Fecha de viaje</label>' +
        '<input type="date" id="fecha-viaje">' +
        '<div class="mensaje-error" id="error-fecha">Selecciona una fecha válida.</div>' +
      '</div>' +
      '<div class="form-grupo">' +
        '<label>Elige tus asientos en el bus</label>' +
        '<div class="plano-bus">' +
          '<div class="piso">' +
            '<div class="piso-titulo"><span>PISO 1</span><span>Asientos 1 - 40</span></div>' +
            '<div id="plano-piso1"></div>' +
          '</div>' +
          '<div class="piso">' +
            '<div class="piso-titulo"><span>PISO 2</span><span>Asientos 41 - 64</span></div>' +
            '<div id="plano-piso2"></div>' +
          '</div>' +
          '<div class="leyenda">' +
            '<span><span class="muestra-asiento"></span> Disponible</span>' +
            '<span><span class="muestra-asiento seleccionada"></span> Seleccionado</span>' +
            '<span><span class="muestra-asiento ocupada"></span> Ocupado</span>' +
          '</div>' +
        '</div>' +
        '<div class="mensaje-error" id="error-asientos">Selecciona un asiento por pasajero.</div>' +
      '</div>' +
      '<div class="form-grupo">' +
        '<label for="pasajeros">Número de pasajeros</label>' +
        '<select id="pasajeros">' +
          '<option value="1">1 pasajero</option>' +
          '<option value="2">2 pasajeros</option>' +
          '<option value="3">3 pasajeros</option>' +
          '<option value="4">4 pasajeros</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-grupo">' +
        '<label>Método de pago</label>' +
        '<div class="metodos-pago">' +
          '<button type="button" class="metodo-item" data-pago="tarjeta">' +
            '<input type="radio" name="pago" value="tarjeta"><span>💳 Tarjeta</span>' +
          '</button>' +
          '<button type="button" class="metodo-item" data-pago="yape">' +
            '<input type="radio" name="pago" value="yape"><span>📱 Yape / Plin</span>' +
          '</button>' +
          '<button type="button" class="metodo-item" data-pago="transferencia">' +
            '<input type="radio" name="pago" value="transferencia"><span>🏦 Transferencia</span>' +
          '</button>' +
          '<button type="button" class="metodo-item" data-pago="efectivo">' +
            '<input type="radio" name="pago" value="efectivo"><span>💵 Efectivo en terminal</span>' +
          '</button>' +
        '</div>' +
        '<div class="datos-tarjeta" id="datos-tarjeta">' +
          '<div class="form-grupo">' +
            '<label for="num-tarjeta">Número de tarjeta</label>' +
            '<input type="text" id="num-tarjeta" placeholder="0000 0000 0000 0000" inputmode="numeric" maxlength="19">' +
          '</div>' +
          '<div class="form-grupo">' +
            '<label for="titular-tarjeta">Titular</label>' +
            '<input type="text" id="titular-tarjeta" placeholder="Como aparece en la tarjeta">' +
          '</div>' +
          '<div class="fila-tarjeta">' +
            '<div class="form-grupo">' +
              '<label for="venc-tarjeta">Vencimiento</label>' +
              '<input type="text" id="venc-tarjeta" placeholder="MM/AA" maxlength="5">' +
            '</div>' +
            '<div class="form-grupo">' +
              '<label for="cvv-tarjeta">CVV</label>' +
              '<input type="password" id="cvv-tarjeta" placeholder="123" maxlength="4" inputmode="numeric">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="mensaje-error" id="error-pago">Selecciona un método de pago.</div>' +
      '</div>' +
      '<div class="form-grupo">' +
        '<label>Total a pagar</label>' +
        '<div class="viaje-precio" id="total">S/ 0.00</div>' +
      '</div>' +
      '<button type="submit" class="btn btn-primario btn-bloque">Confirmar reserva</button>' +
    '</form>' +
    '<p class="texto-centro mt-16" style="font-size:0.85rem;color:var(--gris);">El pago se confirma en terminales y agencias autorizadas.</p>';

  const fechaInput = document.getElementById("fecha-viaje");
  const alerta = document.getElementById("alerta");
  const errorFecha = document.getElementById("error-fecha");
  const errorAsientos = document.getElementById("error-asientos");
  const errorPago = document.getElementById("error-pago");
  const selectPasajeros = document.getElementById("pasajeros");
  const total = document.getElementById("total");
  const datosTarjeta = document.getElementById("datos-tarjeta");

  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1);
  fechaInput.min = hoy.toISOString().split("T")[0];

  const asientos = {};
  const asientosSeleccionados = [];
  let pagoSeleccionado = "";

  function cantidadPasajeros() {
    return parseInt(selectPasajeros.value, 10);
  }

  function actualizarTotal() {
    const cantidad = asientosSeleccionados.length;
    total.textContent = "S/ " + (viaje.precio * cantidad).toFixed(2);
  }

  function agregarAsiento(numero) {
    if (asientosSeleccionados.length >= cantidadPasajeros()) return;
    asientosSeleccionados.push(numero);
    const boton = asientos[numero];
    boton.classList.remove("seleccionado");
    boton.classList.add("seleccionado");
    boton.disabled = true;
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
    const reservas = obtenerReservas();
    const ocupados = {};
    reservas.forEach(function (r) {
      if (r.viajeId === viaje.id && r.fecha === fecha) {
        (r.asiento || []).forEach(function (asiento) {
          ocupados[asiento] = true;
        });
      }
    });
    return ocupados;
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
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "asiento";
      boton.textContent = numero;
      boton.title = "Asiento " + numero;

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
              alerta.textContent = "Solo puedes elegir " + cantidadPasajeros() + " asiento(s). Ajusta la cantidad de pasajeros.";
              alerta.classList.add("visible");
              return;
            }
            agregarAsiento(numero);
          }
        });
      }

      asientos[numero] = boton;
      fila.appendChild(boton);
    });
    return fila;
  }

  function crearEscalera() {
    const escalera = document.createElement("div");
    escalera.className = "escalera";
    escalera.innerHTML = "🪜 Escaleras - subida al piso 2";
    return escalera;
  }

  function dibujarPlano(ocupados) {
    const piso1 = document.getElementById("plano-piso1");
    const piso2 = document.getElementById("plano-piso2");
    piso1.innerHTML = "";
    piso2.innerHTML = "";

    let numero = 1;

    for (let fila = 1; fila <= 10; fila++) {
      piso1.appendChild(crearFila([numero, numero + 1, numero + 2, numero + 3], ocupados));
      numero += 4;
    }

    for (let fila = 1; fila <= 4; fila++) {
      piso2.appendChild(crearFila([numero, numero + 1, numero + 2, numero + 3], ocupados));
      numero += 4;
    }

    piso2.appendChild(crearEscalera());
    piso2.appendChild(crearEscalera());

    for (let fila = 1; fila <= 2; fila++) {
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
      alerta.textContent = "Verifica los datos de tu tarjeta.";
      alerta.classList.add("visible");
      valido = false;
    }

    if (!valido) return;

    const sesion = obtenerSesion();
    const cantidad = asientosSeleccionados.length;
    const asientosOrdenados = asientosSeleccionados.slice().sort(function (a, b) { return a - b; });

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
      total: viaje.precio * cantidad,
      metodoPago: pagoSeleccionado,
      estado: "Confirmada"
    };

    const reservas = obtenerReservas();
    reservas.push(reserva);
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservas));

    alerta.classList.remove("alert-error");
    alerta.classList.add("alert-exito");
    alerta.textContent = "¡Reserva confirmada! Asiento(s) " + asientosOrdenados.join(", ") + ". Pago: " + pagoSeleccionado + ".";
    alerta.classList.add("visible");

    dibujarPlano(ocupadosEnFecha());
    e.target.querySelector("button").disabled = true;
  });
});
