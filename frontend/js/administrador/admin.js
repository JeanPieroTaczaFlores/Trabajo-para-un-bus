const ROLES = ["cliente", "personal", "admin"];
const ROL_LABEL = { cliente: "👤 Cliente", personal: "🧑‍✈️ Personal", admin: "🛡️ Administrador" };

document.addEventListener("DOMContentLoaded", async function () {
  const contenedor = document.getElementById("contenido-admin");
  const sesion = await verificarSesion();

  if (!sesion || sesion.rol !== "admin") {
    window.location.href = rutaLogin();
    return;
  }

  const secciones = {
    resumen: "📊 Resumen",
    usuarios: "👥 Usuarios",
    permisos: "🔐 Permisos",
    logs: "📋 Auditoría"
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
      '<div class="seccion-titulo"><h1>Panel de administración</h1><p>Bienvenido, <strong>' + nombreCorto() + '</strong></p></div>' +
      '<div class="panel-personal">' +
        '<aside class="panel-menu">' +
          '<div class="panel-usuario"><span class="panel-avatar">' + inicial() + '</span><div><strong>' + sesion.nombre + '</strong><span>Administración Andesbus</span></div></div>' +
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

  function filaUsuario(u) {
    return (
      '<tr>' +
        '<td><strong>' + u.nombre + '</strong><br><span class="viaje-info">' + u.correo + '</span></td>' +
        '<td>' + (u.telefono || "—") + '</td>' +
        '<td>' + (u.dni || "—") + '</td>' +
        '<td>' + (ROL_LABEL[u.rol] || u.rol) + '</td>' +
        '<td><span class="estado ' + (u.activo ? "estado-llegado" : "estado-mantenimiento") + '">' + (u.activo ? "Activo" : "Inactivo") + '</span></td>' +
        '<td>' + u.reservas + '</td>' +
        '<td>' +
          '<button type="button" class="btn btn-secundario btn-chico editar-usuario" data-id="' + u.id + '">✏️ Editar</button> ' +
          (u.activo
            ? '<button type="button" class="btn btn-chico desactivar-usuario" data-id="' + u.id + '">🚫 Desactivar</button>'
            : '<button type="button" class="btn btn-chico activar-usuario" data-id="' + u.id + '">✅ Activar</button>') +
        '</td>' +
      '</tr>'
    );
  }

  var renderizar = {

    resumen: async function () {
      const datos = await apiGet('/api/admin/stats');
      const t = datos.totales;
      var caja = document.querySelector('.panel-seccion[data-seccion="resumen"]');

      var max7d = 1;
      (datos.reservas7d || []).forEach(function (d) { if (d.total > max7d) max7d = d.total; });
      var barras = (datos.reservas7d || []).map(function (d) {
        var alto = Math.max(8, Math.round((Number(d.total) / max7d) * 100));
        return '<div class="barra-dia"><div class="barra-llena" style="height:' + alto + '%"></div><span>' + d.dia + '</span><strong>' + d.total + '</strong></div>';
      }).join("");

      var metodos = (datos.porMetodoPago || []).map(function (m) {
        return '<span class="estado estado-terminal">' + (m.metodo || "—") + ': ' + m.total + '</span>';
      }).join(" ");

      var actividad = (datos.actividad || []).map(function (l) {
        return (
          '<div class="reserva-item">' +
            '<div><strong>' + l.usuario_nombre + '</strong> · ' + l.accion + '</div>' +
            '<div class="viaje-info">' + (l.modulo || "") + (l.detalle ? ' · ' + l.detalle : '') + ' · ' + l.creado_en + '</div>' +
          '</div>'
        );
      }).join("");

      caja.innerHTML =
        '<div class="resumen-grid">' +
          '<div class="tarjeta"><div class="icono">👥</div><h3>Clientes</h3><p class="resumen-num">' + t.clientes + '</p></div>' +
          '<div class="tarjeta"><div class="icono">🧑‍✈️</div><h3>Personal</h3><p class="resumen-num">' + t.personal + '</p></div>' +
          '<div class="tarjeta"><div class="icono">🛡️</div><h3>Administradores</h3><p class="resumen-num">' + t.admins + '</p></div>' +
          '<div class="tarjeta"><div class="icono">🎫</div><h3>Reservas</h3><p class="resumen-num">' + t.reservas + '</p></div>' +
          '<div class="tarjeta"><div class="icono">⏳</div><h3>Pagos por confirmar</h3><p class="resumen-num">' + t.pagosPendientes + '</p></div>' +
          '<div class="tarjeta"><div class="icono">🚍</div><h3>Vehículos</h3><p class="resumen-num">' + t.vehiculos + ' <span class="viaje-info">(' + t.vehiculosEnRuta + ' en ruta)</span></p></div>' +
          '<div class="tarjeta"><div class="icono">🛤️</div><h3>Viajes activos</h3><p class="resumen-num">' + t.viajes + '</p></div>' +
          '<div class="tarjeta"><div class="icono">💰</div><h3>Ingresos</h3><p class="resumen-num">S/ ' + Number(t.ingresos).toFixed(2) + '</p></div>' +
        '</div>' +
        '<div class="admin-cuadro">' +
          '<h3 class="seccion-titulo">Reservas de los últimos 7 días</h3>' +
          '<div class="barras">' + (barras || '<p class="vacio">Sin reservas recientes.</p>') + '</div>' +
        '</div>' +
        '<div class="admin-cuadro">' +
          '<h3 class="seccion-titulo">Métodos de pago usados</h3>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + (metodos || '<span class="vacio">—</span>') + '</div>' +
        '</div>' +
        '<div class="admin-cuadro">' +
          '<h3 class="seccion-titulo">Actividad reciente</h3>' +
          (actividad || '<p class="vacio">Sin actividad reciente.</p>') +
        '</div>';
    },

    usuarios: async function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="usuarios"]');
      var usuarios = await apiGet('/api/admin/usuarios');

      caja.innerHTML =
        '<div class="form-caja form-caja-ancha">' +
          '<h3>Crear usuario</h3>' +
          '<div class="fila-doble">' +
            '<div class="form-grupo"><label for="nu-nombre">Nombre completo</label><input type="text" id="nu-nombre"></div>' +
            '<div class="form-grupo"><label for="nu-correo">Correo</label><input type="email" id="nu-correo"></div>' +
          '</div>' +
          '<div class="fila-doble">' +
            '<div class="form-grupo"><label for="nu-telefono">Teléfono</label><input type="text" id="nu-telefono" maxlength="9"></div>' +
            '<div class="form-grupo"><label for="nu-dni">DNI</label><input type="text" id="nu-dni" maxlength="8"></div>' +
          '</div>' +
          '<div class="fila-doble">' +
            '<div class="form-grupo"><label for="nu-rol">Rol</label><select id="nu-rol">' + ROLES.map(function (r) { return '<option value="' + r + '">' + ROL_LABEL[r] + '</option>'; }).join("") + '</select></div>' +
            '<div class="form-grupo"><label for="nu-clave">Contraseña</label><input type="password" id="nu-clave"></div>' +
          '</div>' +
          '<button class="btn btn-primario" id="btn-crear-usuario">➕ Crear usuario</button>' +
          '<div class="alert alert-error hidden" id="alerta-usuario"></div>' +
        '</div>' +
        '<div class="admin-cuadro">' +
          '<h3 class="seccion-titulo">Usuarios (' + usuarios.usuarios.length + ')</h3>' +
          '<div class="fila-doble" style="margin-bottom:10px;">' +
            '<div class="form-grupo"><label>Buscar</label><input type="text" id="buscar-usuarios" placeholder="Nombre, correo o DNI"></div>' +
            '<div class="form-grupo"><label>Rol</label><select id="filtro-rol"><option value="">Todos</option>' + ROLES.map(function (r) { return '<option value="' + r + '">' + ROL_LABEL[r] + '</option>'; }).join("") + '</select></div>' +
          '</div>' +
          '<div class="tabla-envoltorio">' +
            '<table class="admin-tabla">' +
              '<thead><tr><th>Nombre</th><th>Teléfono</th><th>DNI</th><th>Rol</th><th>Estado</th><th>Reservas</th><th>Acciones</th></tr></thead>' +
              '<tbody id="tabla-usuarios">' + usuarios.usuarios.map(filaUsuario).join("") + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>';

      document.getElementById("btn-crear-usuario").addEventListener("click", async function () {
        var alerta = document.getElementById("alerta-usuario");
        alerta.classList.remove("visible", "alert-error", "alert-exito");
        var cuerpo = {
          nombre: document.getElementById("nu-nombre").value.trim(),
          correo: document.getElementById("nu-correo").value.trim().toLowerCase(),
          telefono: document.getElementById("nu-telefono").value.trim() || null,
          dni: document.getElementById("nu-dni").value.trim() || null,
          rol: document.getElementById("nu-rol").value,
          contrasena: document.getElementById("nu-clave").value
        };
        if (!cuerpo.nombre || !cuerpo.correo || !cuerpo.contrasena) {
          alerta.classList.add("visible", "alert-error");
          alerta.textContent = "Completa nombre, correo y contraseña.";
          return;
        }
        try {
          const datos = await apiPost('/api/admin/usuarios', cuerpo);
          alerta.classList.add("visible", "alert-exito");
          alerta.textContent = datos.mensaje;
          ["nu-nombre", "nu-correo", "nu-telefono", "nu-dni", "nu-clave"].forEach(function (id) {
            document.getElementById(id).value = "";
          });
          await renderizar.usuarios();
        } catch (error) {
          alerta.classList.add("visible", "alert-error");
          alerta.textContent = error.message;
        }
      });

      var tbody = document.getElementById("tabla-usuarios");
      var busquedaInput = document.getElementById("buscar-usuarios");
      var rolInput = document.getElementById("filtro-rol");

      function aplicarFiltro() {
        var busqueda = busquedaInput.value.trim().toLowerCase();
        var rol = rolInput.value;
        var filas = usuarios.usuarios.filter(function (u) {
          var okRol = !rol || u.rol === rol;
          var okTexto = !busqueda ||
            u.nombre.toLowerCase().indexOf(busqueda) !== -1 ||
            u.correo.toLowerCase().indexOf(busqueda) !== -1 ||
            String(u.dni || "").indexOf(busqueda) !== -1;
          return okRol && okTexto;
        });
        tbody.innerHTML = filas.map(filaUsuario).join("") || '<tr><td colspan="7"><p class="vacio">Sin resultados.</p></td></tr>';
        vincularAcciones();
      }

      busquedaInput.addEventListener("input", aplicarFiltro);
      rolInput.addEventListener("change", aplicarFiltro);

      function vincularAcciones() {
        tbody.querySelectorAll(".editar-usuario").forEach(function (boton) {
          boton.addEventListener("click", function () {
            var u = usuarios.usuarios.find(function (x) { return x.id === parseInt(boton.getAttribute("data-id"), 10); });
            if (!u) return;
            var nuevoNombre = prompt("Nombre completo:", u.nombre);
            if (nuevoNombre === null) return;
            var nuevoRol = prompt("Rol (cliente, personal, admin):", u.rol);
            if (nuevoRol === null) return;
            if (!ROLES.includes(nuevoRol)) { mostrarError("Rol inválido."); return; }
            var nuevaClave = prompt("Nueva contraseña (vacío para no cambiarla):", "");
            if (nuevaClave === null) return;
            apiPut('/api/admin/usuarios/' + u.id, {
              nombre: nuevoNombre.trim(),
              rol: nuevoRol,
              contrasena: nuevaClave || null,
              activo: u.activo
            }).then(function (datos) {
              mostrarExito(datos.mensaje);
              return renderizar.usuarios();
            }).catch(function (error) {
              mostrarError(error.message);
            });
          });
        });

        tbody.querySelectorAll(".desactivar-usuario, .activar-usuario").forEach(function (boton) {
          boton.addEventListener("click", async function () {
            var id = parseInt(boton.getAttribute("data-id"), 10);
            var u = usuarios.usuarios.find(function (x) { return x.id === id; });
            if (!u) return;
            if (u.activo && !confirmarAccion("¿Desactivar a " + u.nombre + "? Ya no podrá iniciar sesión.")) return;
            try {
              if (u.activo) {
                await apiDelete('/api/admin/usuarios/' + id);
                mostrarExito("Usuario desactivado.");
              } else {
                await apiPut('/api/admin/usuarios/' + id, { nombre: u.nombre, rol: u.rol, activo: true });
                mostrarExito("Usuario activado.");
              }
              await renderizar.usuarios();
            } catch (error) {
              mostrarError(error.message);
            }
          });
        });
      }

      vincularAcciones();
    },

    permisos: async function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="permisos"]');
      var datos = await apiGet('/api/admin/permisos');
      var roles = datos.roles;

      function filaPermiso(p) {
        var celdas = roles.map(function (rol) {
          var activo = p.roles.indexOf(rol) !== -1;
          var disabled = rol === "admin" ? " disabled" : "";
          return (
            '<td>' +
              '<input type="checkbox" class="permiso-check" data-permiso="' + p.id + '" data-rol="' + rol + '"' + (activo ? " checked" : "") + disabled + '>' +
            '</td>'
          );
        }).join("");
        return '<tr><td><strong>' + p.codigo + '</strong><br><span class="viaje-info">' + p.descripcion + '</span></td>' + celdas + '</tr>';
      }

      caja.innerHTML =
        '<div class="nota-aviso visible">🔐 Los permisos del rol <strong>admin</strong> son fijos (acceso total). Marca o desmarca los permisos de <strong>cliente</strong> y <strong>personal</strong>.</div>' +
        '<div class="tabla-envoltorio">' +
          '<table class="admin-tabla">' +
            '<thead><tr><th>Permiso</th>' + roles.map(function (r) { return '<th>' + ROL_LABEL[r] + '</th>'; }).join("") + '</tr></thead>' +
            '<tbody>' + datos.permisos.map(filaPermiso).join("") + '</tbody>' +
          '</table>' +
        '</div>';

      caja.querySelectorAll(".permiso-check").forEach(function (check) {
        check.addEventListener("change", async function () {
          var permisoId = check.getAttribute("data-permiso");
          var rol = check.getAttribute("data-rol");
          try {
            const datos = await apiPut('/api/admin/permisos/' + permisoId, { rol: rol, activo: check.checked });
            mostrarExito(datos.mensaje);
          } catch (error) {
            mostrarError(error.message);
            check.checked = !check.checked;
          }
        });
      });
    },

    logs: async function () {
      var caja = document.querySelector('.panel-seccion[data-seccion="logs"]');
      var modulos = ["auth", "perfil", "viajes", "reservas", "pagos", "clientes", "equipo", "vehiculos", "bitacora", "usuarios", "permisos"];

      caja.innerHTML =
        '<div class="form-caja form-caja-ancha">' +
          '<div class="fila-doble">' +
            '<div class="form-grupo"><label>Módulo</label><select id="filtro-modulo"><option value="">Todos</option>' + modulos.map(function (m) { return '<option value="' + m + '">' + m + '</option>'; }).join("") + '</select></div>' +
            '<div class="form-grupo"><label>Registros</label><select id="limite-logs"><option>100</option><option>200</option><option>500</option></select></div>' +
          '</div>' +
          '<div class="tabla-envoltorio">' +
            '<table class="admin-tabla">' +
              '<thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Módulo</th><th>Detalle</th><th>IP</th></tr></thead>' +
              '<tbody id="tabla-logs"></tbody>' +
            '</table>' +
          '</div>' +
        '</div>';

      async function cargarLogs() {
        var modulo = document.getElementById("filtro-modulo").value;
        var limite = document.getElementById("limite-logs").value;
        var url = '/api/admin/logs?limite=' + limite + (modulo ? '&modulo=' + modulo : '');
        try {
          var datos = await apiGet(url);
          document.getElementById("tabla-logs").innerHTML = datos.logs.map(function (l) {
            return (
              '<tr>' +
                '<td>' + l.creado_en + '</td>' +
                '<td>' + l.usuario_nombre + '</td>' +
                '<td>' + l.accion + '</td>' +
                '<td>' + l.modulo + '</td>' +
                '<td>' + (l.detalle || "—") + '</td>' +
                '<td>' + (l.ip || "—") + '</td>' +
              '</tr>'
            );
          }).join("") || '<tr><td colspan="6"><p class="vacio">Sin registros.</p></td></tr>';
        } catch (error) {
          document.getElementById("tabla-logs").innerHTML = '<tr><td colspan="6"><p class="vacio">⚠️ ' + error.message + '</p></td></tr>';
        }
      }

      document.getElementById("filtro-modulo").addEventListener("change", cargarLogs);
      document.getElementById("limite-logs").addEventListener("change", cargarLogs);
      cargarLogs();
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
