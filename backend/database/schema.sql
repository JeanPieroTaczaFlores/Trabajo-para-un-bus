-- ============================================================
-- ANDESBUS - Esquema de base de datos (MySQL / MariaDB)
-- Ejecutar con: mysql -u root -p < schema.sql
-- Compatible con MySQL Workbench 8.0 y MariaDB >= 10.4
-- ============================================================

CREATE DATABASE IF NOT EXISTS andesbus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE andesbus;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS logs_actividad;
DROP TABLE IF EXISTS bitacora;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS reserva_asientos;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS vehiculos;
DROP TABLE IF EXISTS equipo;
DROP TABLE IF EXISTS viajes;
DROP TABLE IF EXISTS rol_permisos;
DROP TABLE IF EXISTS permisos;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- USUARIOS (clientes, personal y administradores)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  telefono VARCHAR(20) NULL,
  dni VARCHAR(8) NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol ENUM('cliente','personal','admin') NOT NULL DEFAULT 'cliente',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  reset_token VARCHAR(255) NULL,
  reset_expiracion DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PERMISOS granulares y asignacion por rol
-- ------------------------------------------------------------
CREATE TABLE permisos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE rol_permisos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rol ENUM('cliente','personal','admin') NOT NULL,
  permiso_id INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_rol_permiso (rol, permiso_id),
  CONSTRAINT fk_rp_permiso FOREIGN KEY (permiso_id)
    REFERENCES permisos (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- VIAJES (catalogo diario + viajes creados por personal)
-- fecha NULL = catalogo fijo diario; fecha con valor = viaje unico
-- ------------------------------------------------------------
CREATE TABLE viajes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  origen VARCHAR(60) NOT NULL,
  destino VARCHAR(60) NOT NULL,
  hora TIME NOT NULL,
  duracion VARCHAR(10) NOT NULL DEFAULT '16h',
  precio DECIMAL(10,2) NOT NULL,
  fecha DATE NULL,
  personal_creado TINYINT(1) NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_por INT UNSIGNED NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_viajes_ruta (origen, destino, fecha),
  CONSTRAINT fk_viajes_creador FOREIGN KEY (creado_por)
    REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- EQUIPO (conductores y azafatas)
-- ------------------------------------------------------------
CREATE TABLE equipo (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rol ENUM('conductor','azafata') NOT NULL,
  telefono VARCHAR(20) NULL,
  dni VARCHAR(8) NULL,
  anios INT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_equipo_rol (rol)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- VEHICULOS (flota de buses con sede)
-- ------------------------------------------------------------
CREATE TABLE vehiculos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(10) NOT NULL UNIQUE,
  tipo VARCHAR(40) NOT NULL,
  estado ENUM('En terminal','En ruta','Llegado','En mantenimiento') NOT NULL DEFAULT 'En terminal',
  sede VARCHAR(60) NOT NULL DEFAULT 'Lima',
  viaje_id INT UNSIGNED NULL,
  viaje_fecha DATE NULL,
  conductor_id INT UNSIGNED NULL,
  azafata_id INT UNSIGNED NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vehiculos_estado (estado),
  INDEX idx_vehiculos_sede (sede),
  CONSTRAINT fk_veh_viaje FOREIGN KEY (viaje_id)
    REFERENCES viajes (id) ON DELETE SET NULL,
  CONSTRAINT fk_veh_conductor FOREIGN KEY (conductor_id)
    REFERENCES equipo (id) ON DELETE SET NULL,
  CONSTRAINT fk_veh_azafata FOREIGN KEY (azafata_id)
    REFERENCES equipo (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- RESERVAS
-- ------------------------------------------------------------
CREATE TABLE reservas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  viaje_id INT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  pasajeros INT UNSIGNED NOT NULL DEFAULT 1,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('tarjeta','yape','transferencia','efectivo') NOT NULL,
  estado ENUM('Confirmada','Pendiente de confirmación','Liberado') NOT NULL DEFAULT 'Pendiente de confirmación',
  plan_familiar TINYINT(1) NOT NULL DEFAULT 0,
  fecha_reserva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmado_por INT UNSIGNED NULL,
  INDEX idx_reservas_usuario (usuario_id),
  INDEX idx_reservas_viaje_fecha (viaje_id, fecha),
  INDEX idx_reservas_estado (estado),
  CONSTRAINT fk_res_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_res_viaje FOREIGN KEY (viaje_id)
    REFERENCES viajes (id) ON DELETE CASCADE,
  CONSTRAINT fk_res_confirmador FOREIGN KEY (confirmado_por)
    REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE reserva_asientos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reserva_id INT UNSIGNED NOT NULL,
  asiento SMALLINT UNSIGNED NOT NULL,
  piso TINYINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_reserva_asiento (reserva_id, asiento),
  INDEX idx_asiento (asiento),
  CONSTRAINT fk_ras_reserva FOREIGN KEY (reserva_id)
    REFERENCES reservas (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PAGOS (uno por reserva; el efectivo requiere confirmacion)
-- ------------------------------------------------------------
CREATE TABLE pagos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reserva_id INT UNSIGNED NOT NULL,
  metodo ENUM('tarjeta','yape','transferencia','efectivo') NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  estado ENUM('Confirmado','Pendiente') NOT NULL DEFAULT 'Pendiente',
  confirmado_por INT UNSIGNED NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pagos_reserva (reserva_id),
  INDEX idx_pagos_estado (estado),
  CONSTRAINT fk_pag_reserva FOREIGN KEY (reserva_id)
    REFERENCES reservas (id) ON DELETE CASCADE,
  CONSTRAINT fk_pag_confirmador FOREIGN KEY (confirmado_por)
    REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- BITACORA (recorridos y traslados de la flota)
-- ------------------------------------------------------------
CREATE TABLE bitacora (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('recorrido','traslado') NOT NULL,
  placa VARCHAR(10) NOT NULL,
  conductor VARCHAR(100) NULL,
  origen VARCHAR(60) NOT NULL,
  destino VARCHAR(60) NOT NULL,
  estado VARCHAR(30) NULL,
  fecha DATE NOT NULL,
  hora_salida TIME NULL,
  hora_llegada TIME NULL,
  INDEX idx_bitacora_fecha (fecha),
  INDEX idx_bitacora_placa (placa)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- LOGS DE ACTIVIDAD (auditoria)
-- ------------------------------------------------------------
CREATE TABLE logs_actividad (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  usuario_nombre VARCHAR(100) NOT NULL,
  accion VARCHAR(100) NOT NULL,
  modulo VARCHAR(50) NOT NULL,
  detalle VARCHAR(255) NULL,
  resultado ENUM('Correcto','Error') NOT NULL DEFAULT 'Correcto',
  ip VARCHAR(45) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_fecha (creado_en),
  INDEX idx_logs_usuario (usuario_id),
  CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB;
