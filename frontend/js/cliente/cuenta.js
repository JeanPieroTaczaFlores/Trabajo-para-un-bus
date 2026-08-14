document.addEventListener("DOMContentLoaded", function () {
  const contenido = document.getElementById("contenido-cuenta");

  if (!usuarioAutenticado()) {
    contenido.innerHTML =
      '<div class="form-caja">' +
        '<h2>' + t("cuenta.noSesion") + '</h2>' +
        '<p class="subtitulo">' + t("cuenta.noSesionSub") + '</p>' +
        '<a href="login.html" class="btn btn-azul btn-bloque">' + t("nav.login") + '</a>' +
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

  let reservasHtml;
  if (misReservas.length === 0) {
    reservasHtml = '<p class="vacio">' + t("cuenta.sinReservas") + ' <a href="rutas.html" style="color:var(--naranja);font-weight:600;">' + t("cuenta.busca") + '</a>.</p>';
  } else {
    reservasHtml = misReservas.map(function (r) {
      const asientos = (r.asiento || []).map(function (asiento) {
        return asiento + " (Piso " + pisoDeAsiento(asiento) + ")";
      }).join(", ");
      const pago = t("pago." + r.metodoPago) || "—";
      const estado = t("estado." + r.estado) || r.estado;
      const avisoEfectivo =
        r.metodoPago === "efectivo" && r.estado === "Pendiente de confirmación"
          ? '<div class="nota-aviso visible" style="margin-top:6px;">' + t("cuenta.efectivoNota") + '</div>'
          : "";
      const avisoFamiliar = r.planFamiliar
        ? '<div class="viaje-info" style="color:var(--naranja-oscuro);">' + t("cuenta.familiarNota") + '</div>'
        : "";
      return (
        '<article class="viaje-item">' +
          '<div>' +
            '<div class="viaje-ruta">' + r.origen + ' → ' + r.destino + '</div>' +
            '<div class="viaje-info">' + r.fecha + ' · ' + t("reservas.salida") + ' ' + r.hora + ' · ' + t("reservas.asientos") + ' ' + asientos + '</div>' +
            '<div class="viaje-info">' + t("cuenta.pago") + ': ' + pago + ' · ' + t("cuenta.estado") + ': ' + estado + '</div>' +
            avisoFamiliar +
            avisoEfectivo +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div class="viaje-precio">S/ ' + r.total.toFixed(2) + '</div>' +
            '<span class="viaje-info">' + r.pasajeros + ' ' + t("cuenta.pasajeros") + '</span>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  contenido.innerHTML =
    '<section class="seccion-titulo texto-centro">' +
      '<h1>' + t("cuenta.titulo") + '</h1>' +
      '<p>' + t("cuenta.hola") + ', ' + sesion.nombre + '.</p>' +
    '</section>' +
    '<div class="contacto-grid" style="margin-top:0;">' +
      '<div class="contacto-info">' +
        '<h3>' + t("cuenta.datos") + '</h3>' +
        '<p>👤 ' + t("cuenta.nombre") + ': <strong>' + sesion.nombre + '</strong></p>' +
        '<p>📧 ' + t("cuenta.correo") + ': <strong>' + sesion.correo + '</strong></p>' +
        '<p>📱 ' + t("cuenta.telefono") + ': <strong>' + sesion.telefono + '</strong></p>' +
        '<a href="reservas.html" class="btn btn-primario mt-16">' + t("cuenta.nuevaReserva") + '</a>' +
      '</div>' +
      '<div class="contacto-info">' +
        '<h3>' + t("cuenta.reservas") + ' (' + misReservas.length + ')</h3>' +
        reservasHtml +
      '</div>' +
    '</div>';
});
