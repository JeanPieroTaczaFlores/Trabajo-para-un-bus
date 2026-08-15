-- ============================================================
-- ANDESBUS - Esquema de base de datos (PostgreSQL)
-- Compatible con Supabase (Postgres 15+) y Postgres local.
-- ============================================================

DROP TABLE IF EXISTS logs_actividad CASCADE;
DROP TABLE IF EXISTS bitacora CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS reserva_asientos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS equipo CASCADE;
DROP TABLE IF EXISTS viajes CASCADE;
DROP TABLE IF EXISTS rol_permisos CASCADE;
DROP TABLE IF EXISTS permisos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ------------------------------------------------------------
-- USUARIOS (clientes, personal y administradores)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  telefono VARCHAR(20) NULL,
  dni VARCHAR(8) NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente','personal','admin')),
  activo SMALLINT NOT NULL DEFAULT 1 CHECK (activo IN (0,1)),
  reset_token VARCHAR(255) NULL,
  reset_expiracion TIMESTAMP NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_usuarios_rol ON usuarios (rol);

-- ------------------------------------------------------------
-- PERMISOS granulares y asignacion por rol
-- ------------------------------------------------------------
CREATE TABLE permisos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(150) NOT NULL
);

CREATE TABLE rol_permisos (
  id SERIAL PRIMARY KEY,
  rol TEXT NOT NULL CHECK (rol IN ('cliente','personal','admin')),
  permiso_id INT NOT NULL,
  UNIQUE (rol, permiso_id),
  CONSTRAINT fk_rp_permiso FOREIGN KEY (permiso_id)
    REFERENCES permisos (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- VIAJES (catalogo diario + viajes creados por personal)
-- fecha NULL = catalogo fijo diario; fecha con valor = viaje unico
-- ------------------------------------------------------------
CREATE TABLE viajes (
  id SERIAL PRIMARY KEY,
  origen VARCHAR(60) NOT NULL,
  destino VARCHAR(60) NOT NULL,
  hora TIME NOT NULL,
  duracion VARCHAR(10) NOT NULL DEFAULT '16h',
  precio DECIMAL(10,2) NOT NULL,
  fecha DATE NULL,
  personal_creado SMALLINT NOT NULL DEFAULT 0 CHECK (personal_creado IN (0,1)),
  activo SMALLINT NOT NULL DEFAULT 1 CHECK (activo IN (0,1)),
  creado_por INT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_viajes_creador FOREIGN KEY (creado_por)
    REFERENCES usuarios (id) ON DELETE SET NULL
);
CREATE INDEX idx_viajes_ruta ON viajes (origen, destino, fecha);

-- ------------------------------------------------------------
-- EQUIPO (conductores y azafatas)
-- ------------------------------------------------------------
CREATE TABLE equipo (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('conductor','azafata')),
  telefono VARCHAR(20) NULL,
  dni VARCHAR(8) NULL,
  anios INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_equipo_rol ON equipo (rol);

-- ------------------------------------------------------------
-- VEHICULOS (flota de buses con sede)
-- ------------------------------------------------------------
CREATE TABLE vehiculos (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(10) NOT NULL UNIQUE,
  tipo VARCHAR(40) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'En terminal'
    CHECK (estado IN ('En terminal','En ruta','Llegado','En mantenimiento')),
  sede VARCHAR(60) NOT NULL DEFAULT 'Lima',
  viaje_id INT NULL,
  viaje_fecha DATE NULL,
  conductor_id INT NULL,
  azafata_id INT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_veh_viaje FOREIGN KEY (viaje_id)
    REFERENCES viajes (id) ON DELETE SET NULL,
  CONSTRAINT fk_veh_conductor FOREIGN KEY (conductor_id)
    REFERENCES equipo (id) ON DELETE SET NULL,
  CONSTRAINT fk_veh_azafata FOREIGN KEY (azafata_id)
    REFERENCES equipo (id) ON DELETE SET NULL
);
CREATE INDEX idx_vehiculos_estado ON vehiculos (estado);
CREATE INDEX idx_vehiculos_sede ON vehiculos (sede);

-- ------------------------------------------------------------
-- RESERVAS
-- ------------------------------------------------------------
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  viaje_id INT NOT NULL,
  fecha DATE NOT NULL,
  pasajeros INT NOT NULL DEFAULT 1,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('tarjeta','yape','transferencia','efectivo')),
  estado TEXT NOT NULL DEFAULT 'Pendiente de confirmación'
    CHECK (estado IN ('Confirmada','Pendiente de confirmación','Liberado')),
  plan_familiar SMALLINT NOT NULL DEFAULT 0 CHECK (plan_familiar IN (0,1)),
  fecha_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmado_por INT NULL,
  CONSTRAINT fk_res_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_res_viaje FOREIGN KEY (viaje_id)
    REFERENCES viajes (id) ON DELETE CASCADE,
  CONSTRAINT fk_res_confirmador FOREIGN KEY (confirmado_por)
    REFERENCES usuarios (id) ON DELETE SET NULL
);
CREATE INDEX idx_reservas_usuario ON reservas (usuario_id);
CREATE INDEX idx_reservas_viaje_fecha ON reservas (viaje_id, fecha);
CREATE INDEX idx_reservas_estado ON reservas (estado);

CREATE TABLE reserva_asientos (
  id SERIAL PRIMARY KEY,
  reserva_id INT NOT NULL,
  asiento SMALLINT NOT NULL,
  piso SMALLINT NOT NULL,
  UNIQUE (reserva_id, asiento),
  CONSTRAINT fk_ras_reserva FOREIGN KEY (reserva_id)
    REFERENCES reservas (id) ON DELETE CASCADE
);
CREATE INDEX idx_asiento ON reserva_asientos (asiento);

-- ------------------------------------------------------------
-- PAGOS (uno por reserva; el efectivo requiere confirmacion)
-- Nota: 'Liberado' se usa al cancelar una reserva.
-- ------------------------------------------------------------
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  reserva_id INT NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('tarjeta','yape','transferencia','efectivo')),
  monto DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Confirmado','Pendiente','Liberado')),
  confirmado_por INT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pag_reserva FOREIGN KEY (reserva_id)
    REFERENCES reservas (id) ON DELETE CASCADE,
  CONSTRAINT fk_pag_confirmador FOREIGN KEY (confirmado_por)
    REFERENCES usuarios (id) ON DELETE SET NULL
);
CREATE INDEX idx_pagos_reserva ON pagos (reserva_id);
CREATE INDEX idx_pagos_estado ON pagos (estado);

-- ------------------------------------------------------------
-- BITACORA (recorridos y traslados de la flota)
-- ------------------------------------------------------------
CREATE TABLE bitacora (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('recorrido','traslado')),
  placa VARCHAR(10) NOT NULL,
  conductor VARCHAR(100) NULL,
  origen VARCHAR(60) NOT NULL,
  destino VARCHAR(60) NOT NULL,
  estado VARCHAR(30) NULL,
  fecha DATE NOT NULL,
  hora_salida TIME NULL,
  hora_llegada TIME NULL
);
CREATE INDEX idx_bitacora_fecha ON bitacora (fecha);
CREATE INDEX idx_bitacora_placa ON bitacora (placa);

-- ------------------------------------------------------------
-- LOGS DE ACTIVIDAD (auditoria)
-- ------------------------------------------------------------
CREATE TABLE logs_actividad (
  id SERIAL PRIMARY KEY,
  usuario_id INT NULL,
  usuario_nombre VARCHAR(100) NOT NULL,
  accion VARCHAR(100) NOT NULL,
  modulo VARCHAR(50) NOT NULL,
  detalle VARCHAR(255) NULL,
  resultado TEXT NOT NULL DEFAULT 'Correcto' CHECK (resultado IN ('Correcto','Error')),
  ip VARCHAR(45) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE SET NULL
);
CREATE INDEX idx_logs_fecha ON logs_actividad (creado_en);
CREATE INDEX idx_logs_usuario ON logs_actividad (usuario_id);

-- ------------------------------------------------------------
-- Trigger: equivale a "ON UPDATE CURRENT_TIMESTAMP" de MySQL
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION andesbus_set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_actualizado ON usuarios;
CREATE TRIGGER trg_usuarios_actualizado
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION andesbus_set_actualizado_en();
