document.addEventListener("DOMContentLoaded", function () {
  const formBuscar = document.getElementById("form-buscar");
  const origenInput = document.getElementById("origen");
  const destinoInput = document.getElementById("destino");
  const listaCiudades = document.getElementById("lista-ciudades");
  const resultados = document.getElementById("resultados");
  const mensajeCarga = document.getElementById("mensaje-carga");

  let viajes = [];

  function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function llenarCiudades() {
    const ciudades = viajes.reduce(function (acc, viaje) {
      [viaje.origen, viaje.destino].forEach(function (ciudad) {
        if (acc.indexOf(ciudad) === -1) acc.push(ciudad);
      });
      return acc;
    }, []).sort();

    ciudades.forEach(function (ciudad) {
      const opcion = document.createElement("option");
      opcion.value = ciudad;
      listaCiudades.appendChild(opcion);
    });
  }

  function mostrarViajes(lista) {
    if (mensajeCarga) mensajeCarga.style.display = "none";
    if (lista.length === 0) {
      resultados.innerHTML = '<p class="vacio">' + t("rutas.vacio") + '</p>';
      return;
    }

    const html = lista.map(function (viaje) {
      return (
        '<article class="viaje-item">' +
          '<div>' +
            '<div class="viaje-ruta">' + viaje.origen + ' → ' + viaje.destino + '</div>' +
            '<div class="viaje-info">' + t("rutas.salida") + ': ' + viaje.hora + ' · ' + t("rutas.duracion") + ': ' + viaje.duracion + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div class="viaje-precio">S/ ' + Number(viaje.precio).toFixed(2) + '</div>' +
            '<a href="reservas.html?viaje=' + viaje.id + '" class="btn btn-primario mt-16">' + t("rutas.reservar") + '</a>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    resultados.innerHTML = '<h2 class="seccion-titulo">' + t("rutas.disponibles") + ' (' + lista.length + ')</h2>' + html;
  }

  function filtrar() {
    const origen = normalizar(origenInput.value);
    const destino = normalizar(destinoInput.value);

    const lista = viajes.filter(function (viaje) {
      const cumpleOrigen = !origen || normalizar(viaje.origen) === origen;
      const cumpleDestino = !destino || normalizar(viaje.destino) === destino;
      return cumpleOrigen && cumpleDestino;
    });

    mostrarViajes(lista);
  }

  formBuscar.addEventListener("submit", function (e) {
    e.preventDefault();
    filtrar();
  });

  (async function cargar() {
    try {
      const datos = await apiGet('/api/viajes');
      viajes = datos.viajes;
      llenarCiudades();
      mostrarViajes(viajes);
    } catch (error) {
      if (mensajeCarga) mensajeCarga.style.display = "none";
      resultados.innerHTML = '<p class="vacio">' + (error.message || t("rutas.vacio")) + '</p>';
    }
  })();
});
