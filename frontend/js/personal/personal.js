const SEDES = ["Lima", "Arequipa", "Cusco", "Trujillo", "Puno"];

document.addEventListener("DOMContentLoaded", async function () {
  const contenedor = document.getElementById("contenido-personal");
  const sesion = await verificarSesion();

  if (!sesion || sesion.rol !== "personal") {
    window.location.href = rutaLogin();
    return;
  }

  const secciones = {
    resumen: "📊 Resumen",
    clientes: "👥 Clientes",
    reservas: "🎫 Reservas",
    pagos: "💵 Pagos por confirmar",
    historial: "📜 Historial",
    viajes: "🚌 Viajes",
    nuevo: "➕ Nuevo viaje",
    vehiculos: "🚍 Vehículos",
    conductores: "🧑‍✈️ Conductores",
    azafatas: "👩‍✈️ Azafatas",
    bitacora: "🧭 Recorridos y traslados"
  };

  /* ---------------- carga de datos desde la API ---------------- */

  async function cargarReservas() {
    const datos = await apiGet('/api/reservas/todas');
    return datos.reservas || [];
  }

  async function cargarPagosPendientes() {
    const datos = await apiGet('/api/pagos/pendientes');
    return datos.pendientes || [];
  }

  async function cargarVehiculos() {
    const datos = await apiGet('/api/vehiculos');
    return datos.vehiculos || [];
  }

  async function cargarEquipo() {
    const datos = await apiGet('/api/equipo');
    return datos.equipo || [];
  }

  async function cargarClientes() {
    const datos = await apiGet('/api/clientes');
    return datos.clientes || [];
  }

  async function cargarViajes() {
    const datos = await apiGet('/api/viajes');
    return datos.viajes || [];
  }

  async function cargarBitacora() {
    const datos = await apiGet('/api/bitacora');
    return datos.bitacora || [];
  }

  function pagosPorReserva(pendientes) {
    const mapa = {};
    pendientes.forEach(function (p) { mapa[p.reserva_id] = p; });
    return mapa;
  }

  /* ---------------- utilidades de UI ---------------- */

  function nombreCorto() {
    const partes = sesion.nombre.split(" ");
    return partes[0].charAt(0).toUpperCase() + partes[0].slice(1);
  }

  function inicial() {
    return sesion.nombre.charAt(0).toUpperCase();
  }

  function dibujarCabecera() {
    contenedor.innerHTML =
      '<div class="seccion-titulo"><h1>Panel del personal</h1><p>Bienvenido, <strong>' + nombreCorto() + '</strong></p></div>' +
      '<div class="panel-personal">' +
        '<aside class="panel-menu">' +
          '<div class="panel-usuario"><span class="panel-avatar">' + inicial() + '</span><div><strong>' + sesion.nombre + '</strong><span>Personal Andesbus</span></div></div>' +
          Object.keys(secciones).map(function (clave) {
            return '<button class="panel-menu-btn" data-seccion="' + clave + '">' + secciones[clave] + '</button>';
          }).join("") +
        '</aside>' +
        '<div class="panel-contenido" id="secciones"></div>' +
      '</div>';
  }

  function dibujarSecciones() {
    document.getElementById("secciones").innerHTML =
      Object.keys(secciones).map(function (clave) {
        return '<section class="panel-seccion hidden" data-seccion="' + clave + '"></section>';
      }).join("");
  }

  async function mostrar(seccion) {
    document.querySelectorAll(".panel-seccion").forEach(function (s) {
      s.classList.add("hidden");
    });
    document.querySelector('.panel-seccion[data-seccion="' + seccion + '"]').classList.remove("hidden");
    document.querySelectorAll(".panel-menu-btn").forEach(function (p) {
      p.classList.toggle("activa", p.getAttribute("data-seccion") === seccion);
    });
    try {
      await renderizar[seccion]();
    } catch (error) {
      if (manejarError401(error)) { window.location.href = rutaLogin(); return; }
      const caja = document.querySelector('.panel-seccion[data-seccion="' + seccion + '"]');
      if (caja) caja.innerHTML = '<p class="vacio">⚠️ ' + error.message + '</p>';
    }
  }

  function estadoBadge(estado) {
    var clase = "estado";
    if (estado === "En ruta") clase += " estado-en-ruta";
    else if (estado === "Llegado") clase += " estado-llegado";
    else if (estado === "En mantenimiento") clase += " estado-mantenimiento";
    else clase += " estado-terminal";
    return '<span class="' + clase + '">' + estado + '</span>';
  }

  function fichaReserva(r) {
    const boton = r.estado === "Pendiente de confirmación"
      ? '<button class="btn btn-primario btn-chico confirmar-pago" data-id="' + r.id + '">✅ Confirmar pago (efectivo)</button>'
      : "";
    return (
      '<div class="reserva-item">' +
        '<div><strong>' + r.origen + ' → ' + r.destino + '</strong> · ' + r.fecha + ' · ' + r.hora + '</div>' +
        '<div class="viaje-info">' + (r.cliente || r.correoCliente) + ' · Asientos: ' + (r.asientos || []).join(", ") + ' · ' + r.pasajeros + ' pasajero(s) · S/ ' + Number(r.total).toFixed(2) + ' · ' + r.metodoPago + '</div>' +
        '<div>' + estadoBadge(r.estado) + '</div>' +
        boton +
      '</div>'
    );
  }

  function confirmarPagoDeBoton(boton, pendientes) {
    boton.addEventListener("click", async function () {
      const mapa = pagosPorReserva(pendientes);
      const reservaId = parseInt(boton.getAttribute("data-id"), 10);
      const pago = mapa[reservaId];
      if (!pago) { mostrarError('No se encontró el pago pendiente de esta reserva.'); return; }
      if (!confirmarAccion('¿Confirmar el pago en efectivo de la reserva #' + reservaId + '?')) return;
      try {
        const datos = await apiPost('/api/pagos/' + pago.pago_id + '/confirmar');
        mostrarExito(datos.mensaje);
        const activa = document.querySelector(".panel-menu-btn.activa");
        if (activa) await renderizar[activa.getAttribute("data-seccion")]();
      } catch (error) {
        mostrarError(error.message);
      }
    });
  }

  /* ---------------- renderizado de secciones ---------------- */

  var renderizar = {

    resumen: async function () {
      const [clientes, reservas, equipo, vehiculos, pendientes] = await Promise.all([
        cargarClientes(), cargarReservas(), cargarEquipo(), cargarVehiculos(), cargarPagosPendientes()
      ]);
      var hoy = new Date().toISOString().split("T")[0];
      var historico = reservas.filter(function (r) { return (r.fecha || "") < hoy; }).length;
      var conductores = equipo.filter(function (m) { return m.rol === "conductor"; }).length;
      var azafatas = equipo.filter(function (m) { return m.rol === "azafata"; }).length;
      var enRuta = vehiculos.filter(function (v) { return v.estado === "En ruta"; }).length;

      document.querySelector('.panel-seccion[data-seccion="resumen"]').innerHTML =
        '<div class="resumen-grid">' +
          '<div class="tarjeta"><div class="icono">👥</div><h3>Clientes registrados</h3><p class="resumen-num">' + clientes.length + '</p></div>' +
          '<div class="tarjeta"><div class="icono">🎫</div><h3>Reservas totales</h3><p class="resumen-num">' + reservas.length + '</p></div>' +
          '<div class="tarjeta"><div class="icono">⏳</div><h3>Pagos por confirmar</h3><p class="resumen-num">' + pendientes.length + '</p></div>' +
          '<div class="tarjeta"><div class="icono">🚍</div><h3>Vehículos en ruta</h3><p class="resumen-num">' + enRuta + '</p></div>' +
          '<div class="tarjeta"><div class="icono">🧑‍✈️</div><h3>Conductores</h3><p class="resumen-num">' + conductores + '</p></div>' +
          '<div class="tarjeta"><div class="icono">👩‍✈️</div><h3>Azafatas</h3><p class="resumen-num">' + azafatas + '</p></div>' +
          '<div class="tarjeta"><div class="icono">📜</div><h3>Historial de viajes</h3><p class="resumen-num">' + historico + '</p></div>' +
        '</div>' +
        '<div class="nota-aviso visible">💡 Usa el menú lateral: revisa clientes, reservas y pagos por confirmar, consulta el historial, crea viajes, controla la salida/llegada de los buses y toca un asiento ocupado para ver quién viaja en él.</div>';
    },

    clientes: async function () {
      const [clientes, reservas] = await Promise.all([cargarClientes(), cargarReservas()]);
      var caja = document.querySelector('.panel-seccion[data-seccion="clientes"]');

      if (clientes.length === 0) {
        caja.innerHTML = '<p class="vacio">Aún no hay clientes registrados.</p>';
        return;
      }

      var html = clientes.map(function (u) {
        var reservasCliente = reservas.filter(function (r) { return r.correoCliente === u.correo; });
        var detalle = reservasCliente.length === 0
          ? '<p class="vacio">Sin reservas.</p>'
          : reservasCliente.map(fichaReserva).join("");

        return (
          '<details class="cliente-item">' +
            '<summary><span><strong>' + u.nombre + '</strong> · ' + u.correo + ' · ' + (u.telefono || "-") + '</span>' +
            '<span class="estado estado-terminal">' + reservasCliente.length + ' reserva(s)</span></summary>' +
            '<div class="cliente-detalle">' + detalle + '</div>' +
          '</details>'
        );
      }).join("");

      caja.innerHTML = '<h2 class="seccion-titulo">Clientes (' + clientes.length + ')</h2>' + html;

      const pendientes = await cargarPagosPendientes();
      caja.querySelectorAll(".confirmar-pago").forEach(function (boton) {
        confirmarPagoDeBoton(boton, pendientes);
      });
    },

    reservas: async function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="reservas"]');
      var hoy = new Date().toISOString().split("T")[0];
      var todas = await cargarReservas();
      var activas = todas.filter(function (r) {
        return (r.fecha || "") >= hoy;
      }).sort(function (a, b) {
        return (a.fecha + " " + (a.hora || "")).localeCompare(b.fecha + " " + (b.hora || ""));
      });

      if (activas.length === 0) {
        caja.innerHTML = '<h2 class="seccion-titulo">Reservas</h2><p class="vacio">No hay reservas para hoy o fechas próximas.</p>';
        return;
      }

      var confirmadas = activas.filter(function (r) { return r.estado === "Confirmada"; }).length;
      var pendientesCount = activas.filter(function (r) { return r.estado === "Pendiente de confirmación"; }).length;

      caja.innerHTML =
        '<h2 class="seccion-titulo">Reservas de hoy y próximas (' + activas.length + ')</h2>' +
        '<div class="resumen-grid">' +
          '<div class="tarjeta"><div class="icono">✅</div><h3>Confirmadas</h3><p class="resumen-num">' + confirmadas + '</p></div>' +
          '<div class="tarjeta"><div class="icono">⏳</div><h3>Pendientes de pago</h3><p class="resumen-num">' + pendientesCount + '</p></div>' +
        '</div>' +
        activas.map(fichaReserva).join("");

      const pendientes = await cargarPagosPendientes();
      caja.querySelectorAll(".confirmar-pago").forEach(function (boton) {
        confirmarPagoDeBoton(boton, pendientes);
      });
    },

    pagos: async function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="pagos"]');
      var pendientes = await cargarPagosPendientes();
      pendientes = pendientes.sort(function (a, b) {
        return (b.fecha + " " + (b.hora || "")).localeCompare(a.fecha + " " + (a.hora || ""));
      });

      if (pendientes.length === 0) {
        caja.innerHTML = '<h2 class="seccion-titulo">Pagos por confirmar</h2><p class="vacio">✅ No hay pagos en efectivo pendientes de confirmar.</p>';
        return;
      }

      var totalPendiente = 0;
      pendientes.forEach(function (p) { totalPendiente += Number(p.monto) || 0; });

      var html = pendientes.map(function (p) {
        return (
          '<div class="reserva-item">' +
            '<div><strong>' + p.origen + ' → ' + p.destino + '</strong> · ' + p.fecha + ' · ' + p.hora + '</div>' +
            '<div class="viaje-info">👤 ' + p.cliente + ' · ' + p.correo + ' · Asientos: ' + (p.asientos || "") + ' · S/ ' + Number(p.monto).toFixed(2) + '</div>' +
            '<button class="btn btn-primario btn-chico confirmar-pago" data-id="' + p.pago_id + '">✅ Confirmar pago (efectivo)</button>' +
          '</div>'
        );
      }).join("");

      caja.innerHTML =
        '<h2 class="seccion-titulo">Pagos en efectivo por confirmar (' + pendientes.length + ')</h2>' +
        '<div class="nota-aviso visible">💵 Confirma el pago de cada reserva cuando el cliente llegue al terminal. Importe total por confirmar: <strong>S/ ' + totalPendiente.toFixed(2) + '</strong>. Recuerda: los pagos deben confirmarse antes de la salida del bus.</div>' +
        html;

      caja.querySelectorAll(".confirmar-pago").forEach(function (boton) {
        boton.addEventListener("click", async function () {
          const pagoId = parseInt(boton.getAttribute("data-id"), 10);
          if (!confirmarAccion('¿Confirmar este pago?')) return;
          try {
            const datos = await apiPost('/api/pagos/' + pagoId + '/confirmar');
            mostrarExito(datos.mensaje);
            await renderizar.pagos();
          } catch (error) {
            mostrarError(error.message);
          }
        });
      });
    },

    historial: async function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="historial"]');
      var hoy = new Date().toISOString().split("T")[0];
      var todas = await cargarReservas();
      var historico = todas.filter(function (r) {
        return (r.fecha || "") < hoy;
      });

      if (historico.length === 0) {
        caja.innerHTML = '<h2 class="seccion-titulo">Historial</h2><p class="vacio">Aún no hay viajes pasados registrados.</p>';
        return;
      }

      var porAnio = {};
      historico.forEach(function (r) {
        var anio = (r.fecha || "").slice(0, 4) || "Sin año";
        (porAnio[anio] = porAnio[anio] || []).push(r);
      });
      var anios = Object.keys(porAnio).sort().reverse();

      var html = '<h2 class="seccion-titulo">Historial de viajes (' + historico.length + ')</h2>' +
        '<div class="nota-aviso visible">📅 Registros de viajes anteriores agrupados por año.</div>';

      anios.forEach(function (anio) {
        var lista = porAnio[anio];
        html +=
          '<details class="cliente-item">' +
            '<summary><span><strong>📅 ' + anio + '</strong></span>' +
            '<span class="estado estado-terminal">' + lista.length + ' reserva(s)</span></summary>' +
            '<div class="cliente-detalle">' + lista.map(fichaReserva).join("") + '</div>' +
          '</details>';
      });

      caja.innerHTML = html;

      const pendientes = await cargarPagosPendientes();
      caja.querySelectorAll(".confirmar-pago").forEach(function (boton) {
        confirmarPagoDeBoton(boton, pendientes);
      });
    },

    viajes: async function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="viajes"]');
      var viajes = await cargarViajes();

      function tarjetaViaje(v) {
        var etiqueta = v.personal_creado
          ? '<span class="estado estado-personal">Creado por personal</span>'
          : '<span class="estado estado-terminal">Programado</span>';
        var boton = v.personal_creado
          ? '<button class="btn btn-secundario btn-chico eliminar-viaje" data-id="' + v.id + '">🗑️ Eliminar</button>'
          : "";
        return (
          '<div class="viaje-item">' +
            '<div>' +
              '<div class="viaje-ruta">' + v.origen + ' → ' + v.destino + '</div>' +
              '<div class="viaje-info">Salida: ' + v.hora + ' · Duración: ' + v.duracion + (v.fecha ? ' · Fecha: ' + v.fecha : '') + '</div>' +
              etiqueta +
            '</div>' +
            '<div style="text-align:right;">' +
              '<div class="viaje-precio">S/ ' + Number(v.precio).toFixed(2) + '</div>' +
              boton +
            '</div>' +
          '</div>'
        );
      }

      var diarios = viajes.filter(function (v) { return !v.fecha; });
      var personales = viajes.filter(function (v) { return v.personal_creado; });

      var porFecha = {};
      personales.forEach(function (v) {
        (porFecha[v.fecha || 'sin fecha'] = porFecha[v.fecha || 'sin fecha'] || []).push(v);
      });
      var fechas = Object.keys(porFecha).sort();

      var html = "";
      if (diarios.length > 0) {
        html += '<h3 class="grupo-dia">📅 Todos los días (' + diarios.length + ')</h3>' + diarios.map(tarjetaViaje).join("");
      }
      fechas.forEach(function (fecha) {
        html += '<h3 class="grupo-dia">📅 ' + fecha + ' (' + porFecha[fecha].length + ')</h3>' + porFecha[fecha].map(tarjetaViaje).join("");
      });

      if (!html) {
        caja.innerHTML = '<p class="vacio">No hay viajes registrados.</p>';
        return;
      }

      caja.innerHTML = '<h2 class="seccion-titulo">Viajes por día</h2>' + html;

      caja.querySelectorAll(".eliminar-viaje").forEach(function (boton) {
        boton.addEventListener("click", async function () {
          var id = parseInt(boton.getAttribute("data-id"), 10);
          if (!confirmarAccion('¿Eliminar este viaje creado por el personal?')) return;
          try {
            await apiDelete('/api/viajes-personal/' + id);
            mostrarExito('Viaje eliminado.');
            await renderizar.viajes();
          } catch (error) {
            mostrarError(error.message);
          }
        });
      });
    },

    nuevo: function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="nuevo"]');
      caja.innerHTML =
        '<div class="form-caja form-caja-ancha">' +
          '<h2 class="seccion-titulo">Crear nuevo viaje</h2>' +
          '<div class="alert alert-error hidden" id="alerta-nuevo"></div>' +
          '<div class="fila-doble">' +
            '<div class="form-grupo"><label for="nv-origen">Origen</label><input type="text" id="nv-origen" placeholder="Ej: Lima"></div>' +
            '<div class="form-grupo"><label for="nv-destino">Destino</label><input type="text" id="nv-destino" placeholder="Ej: Chiclayo"></div>' +
          '</div>' +
          '<div class="fila-doble">' +
            '<div class="form-grupo"><label for="nv-fecha">Fecha</label><input type="date" id="nv-fecha"></div>' +
            '<div class="form-grupo"><label for="nv-hora">Hora de salida</label><input type="time" id="nv-hora"></div>' +
          '</div>' +
          '<div class="fila-doble">' +
            '<div class="form-grupo"><label for="nv-duracion">Duración</label><input type="text" id="nv-duracion" placeholder="Ej: 12h"></div>' +
            '<div class="form-grupo"><label for="nv-precio">Precio base (S/)</label><input type="number" id="nv-precio" min="1" step="0.5" placeholder="Ej: 70"></div>' +
          '</div>' +
          '<button class="btn btn-primario btn-bloque" id="btn-crear-viaje">🚌 Crear viaje</button>' +
        '</div>';

      var hoy = new Date();
      document.getElementById("nv-fecha").min = hoy.toISOString().split("T")[0];

      document.getElementById("btn-crear-viaje").addEventListener("click", async function () {
        var origen = document.getElementById("nv-origen").value.trim();
        var destino = document.getElementById("nv-destino").value.trim();
        var fecha = document.getElementById("nv-fecha").value;
        var hora = document.getElementById("nv-hora").value;
        var duracion = document.getElementById("nv-duracion").value.trim();
        var precio = parseFloat(document.getElementById("nv-precio").value);
        var alerta = document.getElementById("alerta-nuevo");

        alerta.classList.remove("visible", "alert-exito", "alert-error");

        if (!origen || !destino || !hora || !duracion || !(precio > 0)) {
          alerta.classList.add("visible", "alert-error");
          alerta.textContent = "Completa todos los campos con datos válidos.";
          return;
        }

        try {
          const datos = await apiPost('/api/viajes-personal', {
            origen: origen,
            destino: destino,
            fecha: fecha || null,
            hora: hora,
            duracion: duracion,
            precio: precio
          });
          alerta.classList.add("visible", "alert-exito");
          alerta.textContent = datos.mensaje;
          ["nv-origen", "nv-destino", "nv-hora", "nv-duracion", "nv-precio"].forEach(function (id) {
            document.getElementById(id).value = "";
          });
          document.getElementById("nv-fecha").value = "";
        } catch (error) {
          alerta.classList.add("visible", "alert-error");
          alerta.textContent = error.message;
        }
      });
    },

    vehiculos: async function () {
      const [vehiculos, equipo, viajes, pendientes] = await Promise.all([
        cargarVehiculos(), cargarEquipo(), cargarViajes(), cargarPagosPendientes()
      ]);
      var caja = document.querySelector('.panel-seccion[data-seccion="vehiculos"]');
      var mapaPagos = pagosPorReserva(pendientes);

      function opcionesPersonas(rol, asignadoId) {
        var opcionesHtml = '<option value="">— Sin asignar —</option>';
        equipo.filter(function (m) { return m.rol === rol; }).forEach(function (m) {
          var seleccionado = String(m.id) === String(asignadoId) ? " selected" : "";
          opcionesHtml += '<option value="' + m.id + '"' + seleccionado + '>' + m.nombre + '</option>';
        });
        return opcionesHtml;
      }

      function opcionesViajes(asignado, soloSede) {
        var opcionesHtml = '<option value="">— Sin viaje asignado —</option>';
        viajes.forEach(function (v) {
          if (soloSede && v.origen !== soloSede) return;
          var sel = v.id === asignado ? " selected" : "";
          opcionesHtml += '<option value="' + v.id + '"' + sel + '>' + v.origen + ' → ' + v.destino + ' · ' + v.hora + '</option>';
        });
        return opcionesHtml;
      }

      var tarjetas = vehiculos.map(function (v) {
        var bloqueado = v.estado === "En ruta" || v.estado === "Llegado";
        var dis = bloqueado ? " disabled" : "";
        var notaBloqueo = bloqueado
          ? '<div class="nota-aviso visible">🔒 Viaje y tripulación fijos mientras el bus está <strong>' + v.estado + '</strong>. Déjalo en el terminal para modificarlos.</div>'
          : "";
        var notaSede = '<div class="nota-aviso visible">📍 Sede actual: <strong>' + v.sede + '</strong>.' +
          (v.estado === "En terminal" ? ' Solo puede tomar rutas que salgan de esta sede.' : '') +
          '</div>';
        var traslado = "";
        if (v.estado === "En terminal") {
          traslado =
            '<div class="traslado-control">' +
              '<select class="traslado-sede" data-placa="' + v.placa + '" aria-label="Trasladar a sede">' +
                SEDES.map(function (s) {
                  return '<option value="' + s + '"' + (s === v.sede ? " selected" : "") + '>' + s + '</option>';
                }).join("") +
              '</select>' +
              '<button type="button" class="btn btn-secundario btn-chico traslado-btn" data-placa="' + v.placa + '">🔄 Trasladar a sede</button>' +
            '</div>';
        }
        var acciones = "";
        if (v.estado === "En terminal") {
          acciones = '<button class="btn btn-primario btn-chico estado-boton" data-placa="' + v.placa + '" data-accion="salida">🚀 Marcar salida</button>' +
                     '<button class="btn btn-secundario btn-chico estado-boton" data-placa="' + v.placa + '" data-accion="mantenimiento">🔧 Mantenimiento</button>';
        } else if (v.estado === "En ruta") {
          acciones = '<button class="btn btn-primario btn-chico estado-boton" data-placa="' + v.placa + '" data-accion="llegada">🏁 Marcar llegada</button>';
        } else if (v.estado === "Llegado") {
          acciones = '<button class="btn btn-secundario btn-chico estado-boton" data-placa="' + v.placa + '" data-accion="terminal">🔁 Volver al terminal</button>';
        } else {
          acciones = '<button class="btn btn-secundario btn-chico estado-boton" data-placa="' + v.placa + '" data-accion="terminal">🔁 Reparado → Terminal</button>';
        }

        return (
          '<div class="vehiculo-card" id="card-' + v.placa + '">' +
            '<div class="vehiculo-cabecera">' +
              '<div><div class="viaje-ruta">🚌 ' + v.placa + ' · ' + v.tipo + '</div></div>' +
              '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
                estadoBadge(v.estado) +
                '<span class="estado estado-sede">📍 ' + v.sede + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="fila-doble">' +
              '<div class="form-grupo"><label>Viaje asignado</label><select class="asignar-viaje" data-placa="' + v.placa + '"' + dis + '>' + opcionesViajes(v.viajeId, bloqueado ? null : v.sede) + '</select></div>' +
              '<div class="form-grupo"><label>Día del viaje</label><input type="date" class="asignar-fecha" data-placa="' + v.placa + '" value="' + (v.viajeFecha || "") + '"' + dis + '></div>' +
            '</div>' +
            '<div class="fila-doble">' +
              '<div class="form-grupo"><label>Conductor</label><select class="asignar-rol" data-placa="' + v.placa + '" data-rol="conductor"' + dis + '>' + opcionesPersonas("conductor", v.conductorId) + '</select></div>' +
              '<div class="form-grupo"><label>Azafata</label><select class="asignar-rol" data-placa="' + v.placa + '" data-rol="azafata"' + dis + '>' + opcionesPersonas("azafata", v.azafataId) + '</select></div>' +
            '</div>' +
            notaBloqueo +
            notaSede +
            traslado +
            '<div class="acciones">' + acciones + '</div>' +
            '<div class="ocupacion" id="ocupacion-' + v.placa + '">' + '<p class="vacio">Cargando pasajeros…</p>' + '</div>' +
          '</div>'
        );
      }).join("");

      caja.innerHTML =
        '<h2 class="seccion-titulo">Vehículos de la flota (' + vehiculos.length + ')</h2>' +
        '<div class="form-caja form-caja-ancha">' +
          '<h3>Registrar vehículo</h3>' +
          '<div class="fila-doble">' +
            '<div class="form-grupo"><label for="nv-placa">Placa</label><input type="text" id="nv-placa" placeholder="Ej: MNO-345" maxlength="10"></div>' +
            '<div class="form-grupo"><label for="nv-tipo">Tipo</label><select id="nv-tipo"><option>Bus 2 pisos</option><option>Bus 1 piso</option><option>Minibús</option></select></div>' +
          '</div>' +
          '<button class="btn btn-primario" id="btn-agregar-vehiculo">➕ Agregar vehículo</button>' +
        '</div>' +
        '<div class="vehiculos-grid">' + tarjetas + '</div>';

      /* pasajeros por vehículo */
      vehiculos.forEach(async function (v) {
        const cajaOcupacion = document.getElementById('ocupacion-' + v.placa);
        try {
          const datos = await apiGet('/api/vehiculos/' + v.id + '/pasajeros');
          cajaOcupacion.innerHTML = planoAsientos(v, datos, mapaPagos);
        } catch (error) {
          cajaOcupacion.innerHTML = '<p class="vacio">' + error.message + '</p>';
        }
      });

      caja.querySelectorAll(".estado-boton").forEach(function (boton) {
        boton.addEventListener("click", async function () {
          var placa = boton.getAttribute("data-placa");
          var accion = boton.getAttribute("data-accion");
          var vehiculoObj = vehiculos.find(function (x) { return x.placa === placa; });
          if (!vehiculoObj) return;

          if (accion === "salida") {
            var pends = pendientes.filter(function (p) {
              return p.origen === vehiculoObj.viajeOrigen && p.destino === vehiculoObj.viajeDestino &&
                (!vehiculoObj.viajeFecha || p.fecha === vehiculoObj.viajeFecha);
            });
            if (pends.length > 0 && !confirmarAccion('⚠️ Hay ' + pends.length + ' pago(s) en efectivo pendiente(s) para ' + placa + '. Confirma los pagos antes de la salida. ¿Salir de todos modos?')) {
              return;
            }
          }

          try {
            const datos = await apiPatch('/api/vehiculos/' + vehiculoObj.id + '/estado', { accion: accion });
            mostrarExito(datos.mensaje);
            await renderizar.vehiculos();
          } catch (error) {
            mostrarError(error.message);
          }
        });
      });

      caja.querySelectorAll(".asignar-viaje").forEach(function (select) {
        select.addEventListener("change", async function () {
          var placa = select.getAttribute("data-placa");
          var vehiculoObj = vehiculos.find(function (v) { return v.placa === placa; });
          if (!vehiculoObj) return;
          try {
            const datos = await apiPut('/api/vehiculos/' + vehiculoObj.id, {
              viajeId: select.value ? parseInt(select.value, 10) : null
            });
            mostrarExito(datos.mensaje);
            await renderizar.vehiculos();
          } catch (error) {
            mostrarError(error.message);
            await renderizar.vehiculos();
          }
        });
      });

      caja.querySelectorAll(".asignar-fecha").forEach(function (input) {
        input.addEventListener("change", async function () {
          var placa = input.getAttribute("data-placa");
          var vehiculoObj = vehiculos.find(function (v) { return v.placa === placa; });
          if (!vehiculoObj) return;
          try {
            const datos = await apiPut('/api/vehiculos/' + vehiculoObj.id, {
              viajeFecha: input.value || null
            });
            mostrarExito(datos.mensaje);
            await renderizar.vehiculos();
          } catch (error) {
            mostrarError(error.message);
            await renderizar.vehiculos();
          }
        });
      });

      caja.querySelectorAll(".asignar-rol").forEach(function (select) {
        select.addEventListener("change", async function () {
          var placa = select.getAttribute("data-placa");
          var rol = select.getAttribute("data-rol");
          var vehiculoObj = vehiculos.find(function (v) { return v.placa === placa; });
          if (!vehiculoObj) return;
          var datosCambio = { conductorId: vehiculoObj.conductorId, azafataId: vehiculoObj.azafataId };
          if (rol === "conductor") datosCambio.conductorId = select.value ? parseInt(select.value, 10) : null;
          else datosCambio.azafataId = select.value ? parseInt(select.value, 10) : null;
          try {
            const datos = await apiPut('/api/vehiculos/' + vehiculoObj.id, datosCambio);
            mostrarExito(datos.mensaje);
            await renderizar.vehiculos();
          } catch (error) {
            mostrarError(error.message);
            await renderizar.vehiculos();
          }
        });
      });

      caja.querySelectorAll(".traslado-btn").forEach(function (boton) {
        boton.addEventListener("click", async function () {
          var placaT = boton.getAttribute("data-placa");
          var selectSede = document.querySelector('.traslado-sede[data-placa="' + placaT + '"]');
          var destino = selectSede ? selectSede.value : "";
          var vehiculoObj = vehiculos.find(function (v) { return v.placa === placaT; });
          if (!vehiculoObj || !destino || destino === vehiculoObj.sede) return;
          if (!confirmarAccion('¿Trasladar el bus ' + placaT + ' de ' + vehiculoObj.sede + ' a ' + destino + '?')) return;
          try {
            const datos = await apiPatch('/api/vehiculos/' + vehiculoObj.id + '/estado', { accion: 'traslado', sede: destino });
            mostrarExito(datos.mensaje);
            await renderizar.vehiculos();
          } catch (error) {
            mostrarError(error.message);
          }
        });
      });

      document.getElementById("btn-agregar-vehiculo").addEventListener("click", async function () {
        var placa = document.getElementById("nv-placa").value.trim().toUpperCase();
        var tipo = document.getElementById("nv-tipo").value;
        if (!placa) { mostrarError('Ingresa una placa.'); return; }
        try {
          const datos = await apiPost('/api/vehiculos', { placa: placa, tipo: tipo });
          mostrarExito(datos.mensaje);
          await renderizar.vehiculos();
        } catch (error) {
          mostrarError(error.message);
        }
      });

      /* ficha del cliente al tocar un asiento ocupado */
      caja.addEventListener("click", async function (e) {
        var asientoBoton = e.target.closest(".asiento-mini.ocupado");
        if (!asientoBoton) return;
        var placa = asientoBoton.getAttribute("data-placa");
        var vehiculoObj = vehiculos.find(function (v) { return v.placa === placa; });
        if (!vehiculoObj) return;
        var info = document.getElementById("info-" + placa);
        if (!info) return;
        var pasajero = asientoBoton.getAttribute("data-pasajero-id");
        try {
          const datos = await apiGet('/api/vehiculos/' + vehiculoObj.id + '/pasajeros');
          var reserva = datos.pasajeros.find(function (p) {
            return String(p.id) === pasajero;
          });
          if (!reserva) return;
          var puedeConfirmar = vehiculoObj.estado === "En terminal";
          var botonPago = reserva.estado === "Pendiente de confirmación" && puedeConfirmar && mapaPagos[reserva.id]
            ? '<button type="button" class="btn btn-primario btn-chico confirmar-pago-bus" data-pago="' + mapaPagos[reserva.id].pago_id + '" data-placa="' + placa + '">✅ Confirmar pago</button>'
            : "";
          info.innerHTML =
            '<div class="cliente-ficha">' +
              '<div><strong>👤 ' + reserva.nombre + '</strong></div>' +
              '<div class="viaje-info">Asiento ' + asientoBoton.getAttribute("data-asiento") + ' · ' + (datos.viaje ? vehiculoObj.viajeOrigen + ' → ' + vehiculoObj.viajeDestino : "") + (vehiculoObj.viajeFecha ? ' · ' + vehiculoObj.viajeFecha : "") + '</div>' +
              '<div class="viaje-info">📧 ' + reserva.correo + (reserva.telefono ? ' · 📱 ' + reserva.telefono : "") + '</div>' +
              '<div class="viaje-info">' + estadoBadge(reserva.estado) + '</div>' +
              botonPago +
            '</div>';
          info.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } catch (error) {
          mostrarError(error.message);
        }
      });

      caja.addEventListener("click", async function (e) {
        var boton = e.target.closest(".confirmar-pago-bus");
        if (!boton) return;
        var placa = boton.getAttribute("data-placa");
        var pagoId = parseInt(boton.getAttribute("data-pago"), 10);
        if (!confirmarAccion('¿Confirmar este pago en efectivo?')) return;
        try {
          const datos = await apiPost('/api/pagos/' + pagoId + '/confirmar');
          mostrarExito(datos.mensaje);
          await renderizar.vehiculos();
          var card = document.getElementById("card-" + placa);
          if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } catch (error) {
          mostrarError(error.message);
        }
      });
    },

    conductores: async function () {
      await renderEquipoRol("conductor", "🧑‍✈️ Conductores", "conductores");
    },

    azafatas: async function () {
      await renderEquipoRol("azafata", "👩‍✈️ Azafatas", "azafatas");
    },

    bitacora: async function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="bitacora"]');
      var actividad = await cargarBitacora();

      if (actividad.length === 0) {
        caja.innerHTML = '<h2 class="seccion-titulo">Recorridos y traslados</h2>' +
          '<p class="vacio">Aún no hay actividad registrada. Cuando un bus salga o sea trasladado, aparecerá aquí.</p>';
        return;
      }

      var porFecha = {};
      actividad.forEach(function (a) {
        (porFecha[a.fecha] = porFecha[a.fecha] || []).push(a);
      });
      var fechas = Object.keys(porFecha).sort().reverse();

      var html = '<h2 class="seccion-titulo">Bitácora por día (' + actividad.length + ')</h2>' +
        '<div class="nota-aviso visible">📅 Recorridos (salidas) y traslados de buses entre sedes, agrupados por día.</div>';

      fechas.forEach(function (fecha) {
        var lista = porFecha[fecha];
        html += '<h3 class="grupo-dia">📅 ' + fecha + ' · ' + lista.length + ' registro(s)</h3>';
        html += lista.map(function (a) {
          var icono = a.tipo === "traslado" ? "🔄" : "🚌";
          var etiqueta = a.tipo === "traslado" ? "Traslado" : "Recorrido";
          var detalle;
          if (a.tipo === "traslado") {
            detalle = 'Sede: <strong>' + a.origen + ' → ' + a.destino + '</strong>';
          } else {
            detalle = 'Ruta: <strong>' + a.origen + ' → ' + a.destino + '</strong>' +
              (a.estado ? ' · <span class="estado ' + (a.estado === "Completado" ? "estado-llegado" : "estado-personal") + '">' + a.estado + '</span>' : '');
          }
          return (
            '<div class="reserva-item">' +
              '<div>' + icono + ' <strong>' + etiqueta + '</strong> · Bus <strong>' + a.placa + '</strong>' +
                (a.conductor ? ' · 🧑‍✈️ ' + a.conductor : '') + '</div>' +
              '<div class="viaje-info">' + detalle + '</div>' +
              '<div class="viaje-info">🕒 ' + (a.horaSalida || "") + (a.horaLlegada ? ' · 🏁 Llegada ' + a.horaLlegada : '') + '</div>' +
            '</div>'
          );
        }).join("");
      });

      caja.innerHTML = html;
    }
  };

  /* ---------------- plano de asientos por vehículo ---------------- */

  function planoAsientos(v, datos, mapaPagos) {
    if (!v.viajeId) {
      return '<p class="vacio">Asigna un viaje al vehículo para ver qué clientes van sentados.</p>';
    }
    const pasajeros = datos.pasajeros || [];
    const ocupados = {};
    const porReserva = {};
    pasajeros.forEach(function (p) {
      (p.asientos ? String(p.asientos).split(',') : []).forEach(function (asiento) {
        const n = Number(asiento);
        ocupados[n] = true;
        porReserva[n] = p;
      });
    });
    const cabecera = '<div class="viaje-info">Viaje asignado: <strong>' + (v.viajeOrigen || '') + ' → ' + (v.viajeDestino || '') + (v.viajeHora ? ' · ' + v.viajeHora : '') + '</strong></div>';

    function fila(inicio, cantidad) {
      let celdas = "";
      for (let i = inicio; i < inicio + cantidad; i++) {
        if (ocupados[i]) {
          celdas += '<button type="button" class="asiento-mini ocupado" data-placa="' + v.placa + '" data-asiento="' + i + '" data-pasajero-id="' + porReserva[i].id + '" title="Asiento ' + i + ' · ' + porReserva[i].nombre + ' (toca para ver ficha)">' + i + '</button>';
        } else {
          celdas += '<span class="asiento-mini libre" title="Asiento ' + i + ' (libre)">' + i + '</span>';
        }
      }
      return '<div class="fila-mini">' + celdas + '</div>';
    }

    let piso1 = "";
    for (let f = 0; f < 5; f++) piso1 += fila(1 + f * 4, 4);
    let piso2 = "";
    for (let f = 0; f < 11; f++) piso2 += fila(21 + f * 4, 4);

    function renderLista() {
      const porPiso = { 1: [], 2: [] };
      pasajeros.forEach(function (p) {
        (p.asientos ? String(p.asientos).split(',') : []).forEach(function (asiento) {
          const n = Number(asiento);
          const puedeConfirmar = v.estado === "En terminal" && p.estado === "Pendiente de confirmación" && mapaPagos[p.id];
          const boton = puedeConfirmar
            ? '<button type="button" class="btn btn-primario btn-chico confirmar-pago-bus" data-pago="' + mapaPagos[p.id].pago_id + '" data-placa="' + v.placa + '">✅ Confirmar pago</button>'
            : (p.estado === "Pendiente de confirmación" ? '<span class="pasajero-nota">⏳ Confirmar antes de la salida</span>' : "");
          porPiso[n <= 20 ? 1 : 2].push(
            '<div class="pasajero-item">' +
              '<span class="pasajero-asiento">Asiento ' + n + '</span>' +
              '<span><strong>' + p.nombre + '</strong></span>' +
              estadoBadge(p.estado) +
              boton +
            '</div>'
          );
        });
      });
      let html = "";
      if (porPiso[1].length > 0) {
        html += '<div class="piso-titulo">PISO 1 · PREMIUM · Asientos 1 - 20 (' + porPiso[1].length + ')</div><div class="pasajeros-lista">' + porPiso[1].join("") + '</div>';
      }
      if (porPiso[2].length > 0) {
        html += '<div class="piso-titulo" style="margin-top:12px;">PISO 2 · ECONÓMICO · Asientos 21 - 64 (' + porPiso[2].length + ')</div><div class="pasajeros-lista">' + porPiso[2].join("") + '</div>';
      }
      if (!html) html = '<p class="vacio">Nadie viaja todavía en este bus para el día seleccionado.</p>';
      return html;
    }

    return (
      cabecera +
      '<div class="plano-mini">' +
        '<div class="piso-titulo">PISO 1 · PREMIUM</div>' + piso1 +
        '<div class="piso-titulo">PISO 2</div>' + piso2 +
      '</div>' +
      '<div class="viaje-info" style="margin-top:10px;font-weight:700;">👥 Pasajeros a bordo (' + Object.keys(ocupados).length + ')</div>' +
      renderLista() +
      '<div class="info-cliente" id="info-' + v.placa + '">👆 Toca un asiento naranja para ver la ficha del cliente.</div>'
    );
  }

  /* ---------------- equipo por rol ---------------- */

  async function renderEquipoRol(rol, titulo, seccion) {
    var caja = document.querySelector('.panel-seccion[data-seccion="' + seccion + '"]');
    var equipo = await cargarEquipo();
    var lista = equipo.filter(function (m) { return m.rol === rol; });
    if (lista.length === 0) {
      caja.innerHTML = '<h2 class="seccion-titulo">' + titulo + '</h2><p class="vacio">No hay miembros registrados en este grupo.</p>';
      return;
    }
    var rolClase = rol === "conductor" ? "estado-en-ruta" : "estado-llegado";
    var rolTexto = rol === "conductor" ? "🧑‍✈️ Conductor" : "👩‍✈️ Azafata";
    var html = lista.map(function (m) {
      return (
        '<div class="equipo-item">' +
          '<div class="equipo-item-cabecera">' +
            '<strong>' + m.nombre + '</strong>' +
            '<span class="estado ' + rolClase + '">' + rolTexto + '</span>' +
          '</div>' +
          '<div class="equipo-item-info">' +
            '<span>📱 ' + (m.telefono || "—") + '</span>' +
            '<span>🪪 DNI: ' + (m.dni || "—") + '</span>' +
            '<span>🕰️ ' + (m.anios || 0) + ' años de experiencia</span>' +
          '</div>' +
        '</div>'
      );
    }).join("");
    caja.innerHTML =
      '<h2 class="seccion-titulo">' + titulo + ' (' + lista.length + ')</h2>' +
      '<div class="nota-aviso visible">🔒 Lista de personal de la empresa. Los cambios solo los realiza la administración.</div>' +
      '<div class="equipo-lista">' + html + '</div>';
  }

  dibujarCabecera();
  dibujarSecciones();

  document.querySelector(".panel-menu").addEventListener("click", function (e) {
    var boton = e.target.closest(".panel-menu-btn");
    if (boton) mostrar(boton.getAttribute("data-seccion"));
  });

  mostrar("resumen");
});
