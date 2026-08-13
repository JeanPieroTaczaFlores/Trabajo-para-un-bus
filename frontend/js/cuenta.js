document.addEventListener("DOMContentLoaded", function () {
  const contenido = document.getElementById("contenido-cuenta");

  if (!usuarioAutenticado()) {
    contenido.innerHTML =
      '<div class="form-caja">' +
        '<h2>No has iniciado sesión</h2>' +
        '<p class="subtitulo">Para ver tu cuenta y tus reservas debes iniciar sesión.</p>' +
        '<a href="login.html" class="btn btn-azul btn-bloque">Iniciar sesión</a>' +
      '</div>';
    return;
  }

  const sesion = obtenerSesion();

  function obtenerReservas() {
    try {
      return JSON.parse(localStorage.getItem(RESERVAS_KEY)) || [];
    } catch {
      return [];
    }
  }

  const misReservas = obtenerReservas().filter(function (r) {
    return r.correoUsuario === sesion.correo;
  });

  const NOMBRES_PAGO = {
    tarjeta: "Tarjeta",
    yape: "Yape / Plin",
    transferencia: "Transferencia",
    efectivo: "Efectivo en terminal"
  };

  let reservasHtml;
  if (misReservas.length === 0) {
    reservasHtml = '<p class="vacio">Aún no tienes reservas. <a href="rutas.html" style="color:var(--naranja);font-weight:600;">Busca tu primer viaje</a>.</p>';
  } else {
    reservasHtml = misReservas.map(function (r) {
      const asientos = (r.asiento || []).map(function (asiento) {
        return asiento + " (Piso " + pisoDeAsiento(asiento) + ")";
      }).join(", ");
      const pago = NOMBRES_PAGO[r.metodoPago] || "No registrado";
      const avisoEfectivo =
        r.metodoPago === "efectivo" && r.estado === "Pendiente de confirmación"
          ? '<div class="nota-aviso visible" style="margin-top:6px;">⏰ Confirma tu pago en el terminal dentro de 6 horas o tu asiento se liberará.</div>'
          : "";
      const avisoFamiliar = r.planFamiliar
        ? '<div class="viaje-info" style="color:var(--naranja-oscuro);">👨‍👩‍👧‍👦 Plan familiar (10% de descuento) aplicado</div>'
        : "";
      return (
        '<article class="viaje-item">' +
          '<div>' +
            '<div class="viaje-ruta">' + r.origen + ' → ' + r.destino + '</div>' +
            '<div class="viaje-info">' + r.fecha + ' · Salida ' + r.hora + ' · Asiento(s) ' + asientos + '</div>' +
            '<div class="viaje-info">Pago: ' + pago + ' · Estado: ' + r.estado + '</div>' +
            avisoFamiliar +
            avisoEfectivo +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div class="viaje-precio">S/ ' + r.total.toFixed(2) + '</div>' +
            '<span class="viaje-info">' + r.pasajeros + ' pasajero(s)</span>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  contenido.innerHTML =
    '<section class="seccion-titulo texto-centro">' +
      '<h1>Mi cuenta</h1>' +
      '<p>Hola, ' + sesion.nombre + '. Aquí puedes ver tus datos y reservas.</p>' +
    '</section>' +
    '<div class="contacto-grid" style="margin-top:0;">' +
      '<div class="contacto-info">' +
        '<h3>Mis datos</h3>' +
        '<p>👤 Nombre: <strong>' + sesion.nombre + '</strong></p>' +
        '<p>📧 Correo: <strong>' + sesion.correo + '</strong></p>' +
        '<p>📱 Teléfono: <strong>' + sesion.telefono + '</strong></p>' +
        '<a href="reservas.html" class="btn btn-primario mt-16">Hacer nueva reserva</a>' +
      '</div>' +
      '<div class="contacto-info">' +
        '<h3>Mis reservas (' + misReservas.length + ')</h3>' +
        reservasHtml +
      '</div>' +
    '</div>';
});
