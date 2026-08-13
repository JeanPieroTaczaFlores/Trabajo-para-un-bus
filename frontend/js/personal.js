const VEHICULOS_KEY = "busEmpresa_vehiculos";
const EQUIPO_KEY = "busEmpresa_equipo";

const VEHICULOS_INICIALES = [
  { placa: "ABC-123", tipo: "Bus 2 pisos", estado: "En ruta", conductor: "Juan Pérez", azafata: "Ana Torres", viajeId: 1, viajeFecha: null },
  { placa: "DEF-456", tipo: "Bus 2 pisos", estado: "En terminal", conductor: "", azafata: "", viajeId: 4, viajeFecha: null },
  { placa: "GHI-789", tipo: "Bus 1 piso", estado: "En ruta", conductor: "Luis Gómez", azafata: "", viajeId: 9, viajeFecha: null },
  { placa: "JKL-012", tipo: "Minibús", estado: "En mantenimiento", conductor: "", azafata: "", viajeId: null, viajeFecha: null }
];

const EQUIPO_INICIAL = [
  { nombre: "Juan Pérez", rol: "conductor" },
  { nombre: "Luis Gómez", rol: "conductor" },
  { nombre: "Carlos Díaz", rol: "conductor" },
  { nombre: "Ana Torres", rol: "azafata" },
  { nombre: "Rosa Flores", rol: "azafata" },
  { nombre: "María León", rol: "azafata" }
];

function obtenerVehiculos() {
  try {
    const datos = localStorage.getItem(VEHICULOS_KEY);
    if (datos === null) {
      guardarVehiculos(VEHICULOS_INICIALES);
      return VEHICULOS_INICIALES.slice();
    }
    const lista = JSON.parse(datos) || [];
    let cambio = false;
    const hoy = new Date().toISOString().split("T")[0];
    lista.forEach(function (v) {
      if (v.viajeId === undefined || v.viajeId === null) {
        const porPlaca = VEHICULOS_INICIALES.find(function (x) { return x.placa === v.placa; });
        if (porPlaca && porPlaca.viajeId) {
          v.viajeId = porPlaca.viajeId;
          cambio = true;
        } else {
          v.viajeId = null;
        }
      }
      if (v.viajeFecha === undefined) v.viajeFecha = null;
      if (v.viajeId && !v.viajeFecha) {
        v.viajeFecha = hoy;
        cambio = true;
      }
    });
    if (cambio) guardarVehiculos(lista);
    return lista;
  } catch {
    return [];
  }
}

function guardarVehiculos(vehiculos) {
  localStorage.setItem(VEHICULOS_KEY, JSON.stringify(vehiculos));
}

function obtenerEquipo() {
  try {
    const datos = localStorage.getItem(EQUIPO_KEY);
    if (datos === null) {
      guardarEquipo(EQUIPO_INICIAL);
      return EQUIPO_INICIAL.slice();
    }
    return JSON.parse(datos) || [];
  } catch {
    return [];
  }
}

function guardarEquipo(equipo) {
  localStorage.setItem(EQUIPO_KEY, JSON.stringify(equipo));
}

function obtenerReservas() {
  try {
    return JSON.parse(localStorage.getItem(RESERVAS_KEY)) || [];
  } catch {
    return [];
  }
}

function sembrarDatosDemo() {
  const hoy = new Date().toISOString().split("T")[0];

  const clientes = [
    { nombre: "Luis Mendoza", correo: "luis.mendoza@gmail.com", telefono: "987111222", contrasena: "cliente123", dni: "70345678" },
    { nombre: "Diana Quispe", correo: "diana.quispe@hotmail.com", telefono: "987222333", contrasena: "cliente123", dni: "71234567" },
    { nombre: "Pedro Salas", correo: "pedro.salas@gmail.com", telefono: "987333444", contrasena: "cliente123", dni: "72345678" },
    { nombre: "Lucía Castro", correo: "lucia.castro@gmail.com", telefono: "987444555", contrasena: "cliente123", dni: "73456789" },
    { nombre: "Jorge Huamán", correo: "jorge.huaman@outlook.com", telefono: "987555666", contrasena: "cliente123", dni: "74567890" },
    { nombre: "Renata Paredes", correo: "renata.paredes@gmail.com", telefono: "987666777", contrasena: "cliente123", dni: "75678901" },
    { nombre: "Adrián Vega", correo: "adrian.vega@gmail.com", telefono: "987777888", contrasena: "cliente123", dni: "76789012" },
    { nombre: "Kiara Llanos", correo: "kiara.llanos@gmail.com", telefono: "987888999", contrasena: "cliente123", dni: "77890123" }
  ];

  const usuarios = obtenerUsuarios();
  const nuevos = clientes.filter(function (c) {
    return !usuarios.some(function (u) { return u.correo === c.correo; });
  });
  if (nuevos.length > 0) {
    usuarios.push.apply(usuarios, nuevos);
    guardarUsuarios(usuarios);
  }

  const base = 900000000;
  const semillaReservas = [
    { id: base + 1, correoUsuario: "luis.mendoza@gmail.com", viajeId: 1, origen: "Lima", destino: "Arequipa", hora: "06:00", duracion: "16h", fecha: hoy, asiento: [3, 4], pasajeros: 2, total: 267, metodoPago: "efectivo", planFamiliar: false, estado: "Pendiente de confirmación", fechaReserva: new Date().toISOString() },
    { id: base + 2, correoUsuario: "diana.quispe@hotmail.com", viajeId: 1, origen: "Lima", destino: "Arequipa", hora: "06:00", duracion: "16h", fecha: hoy, asiento: [7], pasajeros: 1, total: 133.5, metodoPago: "tarjeta", planFamiliar: false, estado: "Confirmada", fechaReserva: new Date().toISOString() },
    { id: base + 3, correoUsuario: "pedro.salas@gmail.com", viajeId: 1, origen: "Lima", destino: "Arequipa", hora: "06:00", duracion: "16h", fecha: hoy, asiento: [9], pasajeros: 1, total: 133.5, metodoPago: "yape", planFamiliar: false, estado: "Confirmada", fechaReserva: new Date().toISOString() },
    { id: base + 4, correoUsuario: "renata.paredes@gmail.com", viajeId: 1, origen: "Lima", destino: "Arequipa", hora: "06:00", duracion: "16h", fecha: hoy, asiento: [12], pasajeros: 1, total: 133.5, metodoPago: "efectivo", planFamiliar: false, estado: "Pendiente de confirmación", fechaReserva: new Date().toISOString() },
    { id: base + 5, correoUsuario: "kiara.llanos@gmail.com", viajeId: 1, origen: "Lima", destino: "Arequipa", hora: "06:00", duracion: "16h", fecha: hoy, asiento: [15], pasajeros: 1, total: 133.5, metodoPago: "yape", planFamiliar: false, estado: "Confirmada", fechaReserva: new Date().toISOString() },
    { id: base + 6, correoUsuario: "lucia.castro@gmail.com", viajeId: 4, origen: "Lima", destino: "Cusco", hora: "07:30", duracion: "21h", fecha: hoy, asiento: [22, 23, 24], pasajeros: 3, total: 297, metodoPago: "efectivo", planFamiliar: false, estado: "Pendiente de confirmación", fechaReserva: new Date().toISOString() },
    { id: base + 7, correoUsuario: "jorge.huaman@outlook.com", viajeId: 4, origen: "Lima", destino: "Cusco", hora: "07:30", duracion: "21h", fecha: hoy, asiento: [26], pasajeros: 1, total: 99, metodoPago: "transferencia", planFamiliar: false, estado: "Confirmada", fechaReserva: new Date().toISOString() },
    { id: base + 8, correoUsuario: "adrian.vega@gmail.com", viajeId: 4, origen: "Lima", destino: "Cusco", hora: "07:30", duracion: "21h", fecha: hoy, asiento: [30], pasajeros: 1, total: 99, metodoPago: "tarjeta", planFamiliar: false, estado: "Confirmada", fechaReserva: new Date().toISOString() }
  ];

  const reservas = obtenerReservas();
  const nuevasReservas = semillaReservas.filter(function (r) {
    return !reservas.some(function (x) { return x.id === r.id; });
  });
  if (nuevasReservas.length > 0) {
    reservas.push.apply(reservas, nuevasReservas);
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservas));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const contenedor = document.getElementById("contenido-personal");
  const sesion = obtenerSesion();

  if (!sesion || sesion.rol !== "personal") {
    window.location.href = rutaLogin();
    return;
  }

  sembrarDatosDemo();

  const secciones = {
    resumen: "📊 Resumen",
    clientes: "👥 Clientes",
    viajes: "🚌 Viajes",
    nuevo: "➕ Nuevo viaje",
    vehiculos: "🚍 Vehículos",
    equipo: "🧑‍✈️ Equipo"
  };

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

  function mostrar(seccion) {
    document.querySelectorAll(".panel-seccion").forEach(function (s) {
      s.classList.add("hidden");
    });
    document.querySelector('.panel-seccion[data-seccion="' + seccion + '"]').classList.remove("hidden");
    document.querySelectorAll(".panel-menu-btn").forEach(function (p) {
      p.classList.toggle("activa", p.getAttribute("data-seccion") === seccion);
    });
    renderizar[seccion]();
  }

  function estadoBadge(estado) {
    var clase = "estado";
    if (estado === "En ruta") clase += " estado-en-ruta";
    else if (estado === "Llegado") clase += " estado-llegado";
    else if (estado === "En mantenimiento") clase += " estado-mantenimiento";
    else clase += " estado-terminal";
    return '<span class="' + clase + '">' + estado + '</span>';
  }

  function clientesPorAsiento(viajeId, fecha) {
    const mapa = {};
    obtenerReservas().forEach(function (r) {
      if (r.viajeId !== viajeId || r.estado === "Liberado") return;
      if (fecha && r.fecha !== fecha) return;
      (r.asiento || []).forEach(function (asiento) {
        mapa[asiento] = r;
      });
    });
    return mapa;
  }

  function pasajerosABordo(viajeId, fecha, placa) {
    const piso1 = [];
    const piso2 = [];
    const vistos1 = {};
    const vistos2 = {};

    obtenerReservas().forEach(function (r) {
      if (r.viajeId !== viajeId || r.estado === "Liberado") return;
      if (fecha && r.fecha !== fecha) return;
      const usuario = obtenerUsuarios().find(function (u) { return u.correo === r.correoUsuario; });
      (r.asiento || []).forEach(function (asiento) {
        const item = { asiento: asiento, nombre: usuario ? usuario.nombre : r.correoUsuario, estado: r.estado, reservaId: r.id };
        (asiento <= 20 ? piso1 : piso2).push(item);
      });
    });
    piso1.sort(function (a, b) { return a.asiento - b.asiento; });
    piso2.sort(function (a, b) { return a.asiento - b.asiento; });

    const vehiculoActual = obtenerVehiculos().find(function (v) { return v.placa === placa; });
    const puedeConfirmar = !!vehiculoActual && vehiculoActual.estado === "En terminal";

    function renderLista(lista, vistos) {
      let html = '<div class="pasajeros-lista">';
      lista.forEach(function (p) {
        let boton = "";
        if (p.estado === "Pendiente de confirmación" && !vistos[p.reservaId]) {
          vistos[p.reservaId] = true;
          if (puedeConfirmar) {
            boton = '<button type="button" class="btn btn-primario btn-chico confirmar-pago-bus" data-id="' + p.reservaId + '" data-placa="' + placa + '">✅ Confirmar pago</button>';
          } else {
            boton = '<span class="pasajero-nota">⏳ Confirmar antes de la salida</span>';
          }
        }
        html +=
          '<div class="pasajero-item">' +
            '<span class="pasajero-asiento">Asiento ' + p.asiento + '</span>' +
            '<span><strong>' + p.nombre + '</strong></span>' +
            estadoBadge(p.estado) +
            boton +
          '</div>';
      });
      html += '</div>';
      return html;
    }

    if (piso1.length + piso2.length === 0) {
      return '<p class="vacio">Nadie viaja todavía en este bus para el día seleccionado.</p>';
    }

    let html = "";
    if (piso1.length > 0) {
      html += '<div class="piso-titulo">PISO 1 · PREMIUM · Asientos 1 - 20 (' + piso1.length + ')</div>' + renderLista(piso1, vistos1);
    }
    if (piso2.length > 0) {
      html += '<div class="piso-titulo" style="margin-top:12px;">PISO 2 · ECONÓMICO · Asientos 21 - 64 (' + piso2.length + ')</div>' + renderLista(piso2, vistos2);
    }
    return html;
  }

  function planoAsientos(viajeId, fecha, placa) {
    if (!viajeId) {
      return '<p class="vacio">Asigna un viaje al vehículo para ver qué clientes van sentados.</p>';
    }
    const ocupados = clientesPorAsiento(viajeId, fecha);
    const viaje = todosLosViajes().find(function (v) { return v.id === viajeId; });
    const cabecera = viaje
      ? '<div class="viaje-info">Viaje asignado: <strong>' + viaje.origen + ' → ' + viaje.destino + ' · ' + viaje.hora + '</strong></div>'
      : "";

    function fila(inicio, cantidad) {
      let celdas = "";
      for (let i = inicio; i < inicio + cantidad; i++) {
        const ocupada = !!ocupados[i];
        const pasajero = ocupada ? ocupados[i].correoUsuario : "";
        celdas += ocupada
          ? '<button type="button" class="asiento-mini ocupado" data-placa="' + placa + '" data-asiento="' + i + '" data-viaje="' + viajeId + '" data-fecha="' + (fecha || "") + '" title="Asiento ' + i + ' · ' + pasajero + ' (toca para ver ficha)">' + i + '</button>'
          : '<span class="asiento-mini libre" title="Asiento ' + i + ' (libre)">' + i + '</span>';
      }
      return '<div class="fila-mini">' + celdas + '</div>';
    }

    let piso1 = "";
    for (let f = 0; f < 5; f++) piso1 += fila(1 + f * 4, 4);
    let piso2 = "";
    for (let f = 0; f < 11; f++) piso2 += fila(21 + f * 4, 4);

    return (
      cabecera +
      '<div class="plano-mini">' +
        '<div class="piso-titulo">PISO 1 · PREMIUM</div>' + piso1 +
        '<div class="piso-titulo">PISO 2</div>' + piso2 +
      '</div>' +
      '<div class="viaje-info" style="margin-top:10px;font-weight:700;">👥 Pasajeros a bordo (' + Object.keys(ocupados).length + ')</div>' +
      pasajerosABordo(viajeId, fecha, placa) +
      '<div class="info-cliente" id="info-' + placa + '">👆 Toca un asiento naranja para ver la ficha del cliente.</div>'
    );
  }

  var renderizar = {
    resumen: function () {
      var usuarios = obtenerUsuarios();
      var reservas = obtenerReservas();
      var pendientes = reservas.filter(function (r) { return r.estado === "Pendiente de confirmación"; }).length;
      var enRuta = obtenerVehiculos().filter(function (v) { return v.estado === "En ruta"; }).length;

      document.querySelector('.panel-seccion[data-seccion="resumen"]').innerHTML =
        '<div class="resumen-grid">' +
          '<div class="tarjeta"><div class="icono">👥</div><h3>Clientes registrados</h3><p class="resumen-num">' + usuarios.length + '</p></div>' +
          '<div class="tarjeta"><div class="icono">🎫</div><h3>Reservas totales</h3><p class="resumen-num">' + reservas.length + '</p></div>' +
          '<div class="tarjeta"><div class="icono">⏳</div><h3>Pagos por confirmar</h3><p class="resumen-num">' + pendientes + '</p></div>' +
          '<div class="tarjeta"><div class="icono">🚍</div><h3>Vehículos en ruta</h3><p class="resumen-num">' + enRuta + '</p></div>' +
        '</div>' +
        '<div class="nota-aviso visible">💡 Usa el menú lateral: revisa clientes, crea viajes, controla la salida/llegada de los buses y toca un asiento ocupado para ver quién viaja en él.</div>';
    },

    clientes: function () {
      var usuarios = obtenerUsuarios();
      var reservas = obtenerReservas();
      var caja = document.querySelector('.panel-seccion[data-seccion="clientes"]');

      if (usuarios.length === 0) {
        caja.innerHTML = '<p class="vacio">Aún no hay clientes registrados.</p>';
        return;
      }

      var html = usuarios.map(function (u) {
        var reservasCliente = reservas.filter(function (r) { return r.correoUsuario === u.correo; });
        var detalle = reservasCliente.length === 0
          ? '<p class="vacio">Sin reservas.</p>'
          : reservasCliente.map(function (r) {
              var boton = r.estado === "Pendiente de confirmación"
                ? '<button class="btn btn-primario btn-chico confirmar-pago" data-id="' + r.id + '">✅ Confirmar pago (efectivo)</button>'
                : "";
              return (
                '<div class="reserva-item">' +
                  '<div><strong>' + r.origen + ' → ' + r.destino + '</strong> · ' + r.fecha + ' · ' + r.hora + '</div>' +
                  '<div class="viaje-info">Asientos: ' + (r.asiento || []).join(", ") + ' · ' + r.pasajeros + ' pasajero(s) · S/ ' + Number(r.total).toFixed(2) + ' · ' + r.metodoPago + '</div>' +
                  '<div>' + estadoBadge(r.estado) + '</div>' +
                  boton +
                '</div>'
              );
            }).join("");

        return (
          '<details class="cliente-item">' +
            '<summary><span><strong>' + u.nombre + '</strong> · ' + u.correo + ' · ' + (u.telefono || "-") + '</span>' +
            '<span class="estado estado-terminal">' + reservasCliente.length + ' reserva(s)</span></summary>' +
            '<div class="cliente-detalle">' + detalle + '</div>' +
          '</details>'
        );
      }).join("");

      caja.innerHTML = '<h2 class="seccion-titulo">Clientes (' + usuarios.length + ')</h2>' + html;

      caja.querySelectorAll(".confirmar-pago").forEach(function (boton) {
        boton.addEventListener("click", function () {
          var reservas2 = obtenerReservas();
          reservas2.forEach(function (r) {
            if (r.id === parseInt(boton.getAttribute("data-id"), 10)) {
              r.estado = "Confirmada";
            }
          });
          localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservas2));
          renderizar.clientes();
        });
      });
    },

    viajes: function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="viajes"]');

      function tarjetaViaje(v) {
        var etiqueta = v.personal
          ? '<span class="estado estado-personal">Creado por personal</span>'
          : '<span class="estado estado-terminal">Programado</span>';
        var boton = v.personal
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

      var diarios = VIAJES;
      var personales = obtenerViajesPersonal();

      var porFecha = {};
      personales.forEach(function (v) {
        (porFecha[v.fecha] = porFecha[v.fecha] || []).push(v);
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
        boton.addEventListener("click", function () {
          var id = parseInt(boton.getAttribute("data-id"), 10);
          guardarViajesPersonal(obtenerViajesPersonal().filter(function (v) { return v.id !== id; }));
          renderizar.viajes();
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

      document.getElementById("btn-crear-viaje").addEventListener("click", function () {
        var origen = document.getElementById("nv-origen").value.trim();
        var destino = document.getElementById("nv-destino").value.trim();
        var fecha = document.getElementById("nv-fecha").value;
        var hora = document.getElementById("nv-hora").value;
        var duracion = document.getElementById("nv-duracion").value.trim();
        var precio = parseFloat(document.getElementById("nv-precio").value);
        var alerta = document.getElementById("alerta-nuevo");

        alerta.classList.remove("visible", "alert-exito", "alert-error");

        if (!origen || !destino || !fecha || !hora || !duracion || !(precio > 0)) {
          alerta.classList.add("visible", "alert-error");
          alerta.textContent = "Completa todos los campos con datos válidos.";
          return;
        }

        var viajes = obtenerViajesPersonal();
        viajes.push({
          id: Date.now(),
          origen: origen,
          destino: destino,
          fecha: fecha,
          hora: hora,
          duracion: duracion,
          precio: precio,
          personal: true
        });
        guardarViajesPersonal(viajes);

        alerta.classList.add("visible", "alert-exito");
        alerta.textContent = "Viaje creado correctamente. Ya aparece en Rutas y Horarios.";

        document.getElementById("nv-origen").value = "";
        document.getElementById("nv-destino").value = "";
        document.getElementById("nv-hora").value = "";
        document.getElementById("nv-duracion").value = "";
        document.getElementById("nv-precio").value = "";
      });
    },

    vehiculos: function () {
      var vehiculos = obtenerVehiculos();
      var equipo = obtenerEquipo();
      var caja = document.querySelector('.panel-seccion[data-seccion="vehiculos"]');

      function opcionesPersonas(rol, asignado) {
        var opcionesHtml = '<option value="">— Sin asignar —</option>';
        equipo.filter(function (m) { return m.rol === rol; }).forEach(function (m) {
          var seleccionado = m.nombre === asignado ? " selected" : "";
          opcionesHtml += '<option value="' + m.nombre + '"' + seleccionado + '>' + m.nombre + '</option>';
        });
        return opcionesHtml;
      }

      function opcionesViajes(asignado) {
        var opcionesHtml = '<option value="">— Sin viaje asignado —</option>';
        todosLosViajes().forEach(function (v) {
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
              estadoBadge(v.estado) +
            '</div>' +
            '<div class="fila-doble">' +
              '<div class="form-grupo"><label>Viaje asignado</label><select class="asignar-viaje" data-placa="' + v.placa + '"' + dis + '>' + opcionesViajes(v.viajeId) + '</select></div>' +
              '<div class="form-grupo"><label>Día del viaje</label><input type="date" class="asignar-fecha" data-placa="' + v.placa + '" value="' + (v.viajeFecha || "") + '"' + dis + '></div>' +
            '</div>' +
            '<div class="fila-doble">' +
              '<div class="form-grupo"><label>Conductor</label><select class="asignar-rol" data-placa="' + v.placa + '" data-rol="conductor"' + dis + '>' + opcionesPersonas("conductor", v.conductor) + '</select></div>' +
              '<div class="form-grupo"><label>Azafata</label><select class="asignar-rol" data-placa="' + v.placa + '" data-rol="azafata"' + dis + '>' + opcionesPersonas("azafata", v.azafata) + '</select></div>' +
            '</div>' +
            notaBloqueo +
            '<div class="acciones">' + acciones + '</div>' +
            '<div class="ocupacion">' + planoAsientos(v.viajeId, v.viajeFecha, v.placa) + '</div>' +
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

      caja.querySelectorAll(".estado-boton").forEach(function (boton) {
        boton.addEventListener("click", function () {
          var placa = boton.getAttribute("data-placa");
          var accion = boton.getAttribute("data-accion");
          var vehiculos2 = obtenerVehiculos();
          var objetivo = vehiculos2.find(function (v) { return v.placa === placa; });
          if (!objetivo) return;
          if (accion === "salida") {
            var pendientes = obtenerReservas().filter(function (r) {
              return r.viajeId === objetivo.viajeId && r.estado === "Pendiente de confirmación" && (!objetivo.viajeFecha || r.fecha === objetivo.viajeFecha);
            });
            if (pendientes.length > 0 && !confirm("⚠️ Hay " + pendientes.length + " pago(s) en efectivo pendiente(s) para " + placa + ". Confirma los pagos antes de la salida. ¿Salir de todos modos?")) {
              return;
            }
          }
          if (accion === "salida") objetivo.estado = "En ruta";
          else if (accion === "llegada") objetivo.estado = "Llegado";
          else if (accion === "mantenimiento") objetivo.estado = "En mantenimiento";
          else if (accion === "terminal") objetivo.estado = "En terminal";
          guardarVehiculos(vehiculos2);
          renderizar.vehiculos();
        });
      });

      caja.querySelectorAll(".asignar-viaje").forEach(function (select) {
        select.addEventListener("change", function () {
          var placa = select.getAttribute("data-placa");
          var vehiculos3 = obtenerVehiculos();
          vehiculos3.forEach(function (v) {
            if (v.placa === placa) {
              v.viajeId = select.value ? parseInt(select.value, 10) : null;
            }
          });
          guardarVehiculos(vehiculos3);
          renderizar.vehiculos();
        });
      });

      caja.querySelectorAll(".asignar-fecha").forEach(function (input) {
        input.addEventListener("change", function () {
          var placa = input.getAttribute("data-placa");
          var vehiculos4 = obtenerVehiculos();
          vehiculos4.forEach(function (v) {
            if (v.placa === placa) {
              v.viajeFecha = input.value || null;
            }
          });
          guardarVehiculos(vehiculos4);
          renderizar.vehiculos();
        });
      });

      caja.querySelectorAll(".asignar-rol").forEach(function (select) {
        select.addEventListener("change", function () {
          var placa = select.getAttribute("data-placa");
          var rol = select.getAttribute("data-rol");
          var vehiculos4 = obtenerVehiculos();
          vehiculos4.forEach(function (v) {
            if (v.placa === placa) {
              if (rol === "conductor") v.conductor = select.value;
              else v.azafata = select.value;
            }
          });
          guardarVehiculos(vehiculos4);
        });
      });

      caja.querySelectorAll(".asiento-mini.ocupado").forEach(function (boton) {
        boton.addEventListener("click", function () {
          var placa = boton.getAttribute("data-placa");
          var asiento = parseInt(boton.getAttribute("data-asiento"), 10);
          var viajeId = parseInt(boton.getAttribute("data-viaje"), 10);
          var fecha = boton.getAttribute("data-fecha") || null;
          var viaje = todosLosViajes().find(function (v) { return v.id === viajeId; });
          var reserva = null;
          obtenerReservas().forEach(function (r) {
            if (r.viajeId === viajeId && (r.asiento || []).indexOf(asiento) !== -1 && r.estado !== "Liberado" && (!fecha || r.fecha === fecha)) {
              reserva = r;
            }
          });
          var info = document.getElementById("info-" + placa);
          if (!reserva) return;
          var usuario = obtenerUsuarios().find(function (u) { return u.correo === reserva.correoUsuario; });
          var vehiculoFicha = obtenerVehiculos().find(function (x) { return x.placa === placa; });
          var puedeFicha = !!vehiculoFicha && vehiculoFicha.estado === "En terminal";
          var botonPago = reserva.estado === "Pendiente de confirmación" && puedeFicha
            ? '<button type="button" class="btn btn-primario btn-chico confirmar-pago-bus" data-id="' + reserva.id + '" data-placa="' + placa + '">✅ Confirmar pago</button>'
            : "";
          info.innerHTML =
            '<div class="cliente-ficha">' +
              '<div><strong>👤 ' + (usuario ? usuario.nombre : reserva.correoUsuario) + '</strong></div>' +
              '<div class="viaje-info">Asiento ' + asiento + ' · ' + (viaje ? viaje.origen + ' → ' + viaje.destino : "") + (fecha ? ' · ' + fecha : "") + '</div>' +
              '<div class="viaje-info">📧 ' + reserva.correoUsuario + (usuario && usuario.telefono ? ' · 📱 ' + usuario.telefono : "") + '</div>' +
              '<div class="viaje-info">' + estadoBadge(reserva.estado) + '</div>' +
              botonPago +
            '</div>';
          info.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      });

      caja.querySelectorAll(".confirmar-pago-bus").forEach(function (boton) {
        boton.addEventListener("click", function () {
          var placa = boton.getAttribute("data-placa");
          var id = parseInt(boton.getAttribute("data-id"), 10);
          var reservas = obtenerReservas();
          reservas.forEach(function (r) {
            if (r.id === id) r.estado = "Confirmada";
          });
          localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservas));
          renderizar.vehiculos();
          document.getElementById("card-" + placa).scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      });

      document.getElementById("btn-agregar-vehiculo").addEventListener("click", function () {
        var placa = document.getElementById("nv-placa").value.trim().toUpperCase();
        var tipo = document.getElementById("nv-tipo").value;
        if (!placa) return;
        var vehiculos5 = obtenerVehiculos();
        vehiculos5.push({ placa: placa, tipo: tipo, estado: "En terminal", conductor: "", azafata: "", viajeId: null });
        guardarVehiculos(vehiculos5);
        renderizar.vehiculos();
      });
    },

    equipo: function () {
      var equipo = obtenerEquipo();
      var caja = document.querySelector('.panel-seccion[data-seccion="equipo"]');

      var lista = equipo.map(function (m) {
        var rolClase = m.rol === "conductor" ? "estado-en-ruta" : "estado-llegado";
        return (
          '<div class="equipo-item">' +
            '<span><strong>' + m.nombre + '</strong> <span class="estado ' + rolClase + '">' + (m.rol === "conductor" ? "🧑‍✈️ Conductor" : "👩‍✈️ Azafata") + '</span></span>' +
          '</div>'
        );
      }).join("");

      caja.innerHTML =
        '<h2 class="seccion-titulo">Equipo de trabajo (' + equipo.length + ')</h2>' +
        '<div class="nota-aviso visible">🔒 Lista de personal de la empresa. Los cambios solo los realiza la administración.</div>' +
        '<div class="equipo-lista">' + lista + '</div>';
    }
  };

  dibujarCabecera();
  dibujarSecciones();

  document.querySelector(".panel-menu").addEventListener("click", function (e) {
    var boton = e.target.closest(".panel-menu-btn");
    if (boton) mostrar(boton.getAttribute("data-seccion"));
  });

  mostrar("resumen");
});
