-- ============================================================
-- ANDESBUS - Datos iniciales (seed) para PostgreSQL
-- Usuarios de prueba (SOLO desarrollo):
--   admin@demo.com     / admin123     -> rol admin
--   carlos@personal.pe / andes123     -> rol personal
--   maria@personal.pe  / andes123     -> rol personal
--   luis.mendoza@gmail.com / cliente123 -> rol cliente
-- Las contrasenas se almacenan con hash bcrypt (nunca en claro).
-- ============================================================

-- ------------------------------------------------------------
-- PERMISOS
-- ------------------------------------------------------------
INSERT INTO permisos (id, codigo, descripcion) VALUES
  (1,  'users.view',       'Ver listado y detalle de usuarios'),
  (2,  'users.create',     'Crear usuarios'),
  (3,  'users.update',     'Editar usuarios y roles'),
  (4,  'users.delete',     'Desactivar/eliminar usuarios'),
  (5,  'clients.view',     'Consultar clientes y sus reservas'),
  (6,  'clients.update',   'Actualizar datos de clientes'),
  (7,  'personal.manage',  'Gestionar el personal'),
  (8,  'viajes.manage',    'Gestionar viajes'),
  (9,  'vehiculos.manage', 'Gestionar vehículos y su estado'),
  (10, 'pagos.confirmar',  'Confirmar pagos en efectivo'),
  (11, 'bitacora.view',    'Ver bitácora de recorridos y traslados'),
  (12, 'reports.view',     'Ver reportes y estadísticas'),
  (13, 'logs.view',        'Ver registros de auditoría'),
  (14, 'settings.manage',  'Configurar el sistema y permisos');

-- Permisos por rol
INSERT INTO rol_permisos (rol, permiso_id) VALUES
  -- ADMIN: todos los permisos
  ('admin', 1), ('admin', 2), ('admin', 3), ('admin', 4),
  ('admin', 5), ('admin', 6), ('admin', 7), ('admin', 8),
  ('admin', 9), ('admin', 10), ('admin', 11), ('admin', 12),
  ('admin', 13), ('admin', 14),
  -- PERSONAL: operaciones del dia a dia (sin gestion de usuarios ni configuracion)
  ('personal', 5), ('personal', 6), ('personal', 8), ('personal', 9),
  ('personal', 10), ('personal', 11), ('personal', 12);

-- ------------------------------------------------------------
-- USUARIOS (id 1 = admin, 2-3 = personal, 4-11 = clientes)
-- ------------------------------------------------------------
INSERT INTO usuarios (id, nombre, correo, telefono, dni, contrasena_hash, rol) VALUES
  (1,  'Administrador Andesbus', 'admin@demo.com', '999111222', '70000000', '$2a$10$peir56QR6ji7I9x6V/K7h.a4pSBVgsVSvJ1YhJ47jz8Kyn62Aw/Fe', 'admin'),
  (2,  'Carlos Ramírez', 'carlos@personal.pe', '999888777', '70000001', '$2a$10$AqI83c2TfPvx7ubpkht8Ueek1CdQvEG4T1zS.4NylYXqvkpImYw3a', 'personal'),
  (3,  'María Torres', 'maria@personal.pe', '999888776', '70000002', '$2a$10$AqI83c2TfPvx7ubpkht8Ueek1CdQvEG4T1zS.4NylYXqvkpImYw3a', 'personal'),
  (4,  'Luis Mendoza', 'luis.mendoza@gmail.com', '987654321', '45120001', '$2a$10$axUauTGBGxgYrdbaHJHH0OSA4LII886V485NqU3II9BilZunxWhj6', 'cliente'),
  (5,  'Diana Quispe', 'diana.quispe@hotmail.com', '987654322', '45120002', '$2a$10$axUauTGBGxgYrdbaHJHH0OSA4LII886V485NqU3II9BilZunxWhj6', 'cliente'),
  (6,  'Pedro Salas', 'pedro.salas@gmail.com', '987654323', '45120003', '$2a$10$axUauTGBGxgYrdbaHJHH0OSA4LII886V485NqU3II9BilZunxWhj6', 'cliente'),
  (7,  'Lucía Castro', 'lucia.castro@gmail.com', '987654324', '45120004', '$2a$10$axUauTGBGxgYrdbaHJHH0OSA4LII886V485NqU3II9BilZunxWhj6', 'cliente'),
  (8,  'Jorge Huamán', 'jorge.huaman@outlook.com', '987654325', '45120005', '$2a$10$axUauTGBGxgYrdbaHJHH0OSA4LII886V485NqU3II9BilZunxWhj6', 'cliente'),
  (9,  'Renata Paredes', 'renata.paredes@gmail.com', '987654326', '45120006', '$2a$10$axUauTGBGxgYrdbaHJHH0OSA4LII886V485NqU3II9BilZunxWhj6', 'cliente'),
  (10, 'Adrián Vega', 'adrian.vega@gmail.com', '987654327', '45120007', '$2a$10$axUauTGBGxgYrdbaHJHH0OSA4LII886V485NqU3II9BilZunxWhj6', 'cliente'),
  (11, 'Kiara Llanos', 'kiara.llanos@gmail.com', '987654328', '45120008', '$2a$10$axUauTGBGxgYrdbaHJHH0OSA4LII886V485NqU3II9BilZunxWhj6', 'cliente');

-- ------------------------------------------------------------
-- VIAJES (catalogo diario, fecha NULL)
-- ------------------------------------------------------------
INSERT INTO viajes (id, origen, destino, hora, duracion, precio) VALUES
  (1,  'Lima',      'Arequipa', '06:00', '16h', 89),
  (2,  'Lima',      'Arequipa', '12:00', '16h', 89),
  (3,  'Lima',      'Arequipa', '20:00', '16h', 99),
  (4,  'Lima',      'Cusco',    '07:30', '21h', 99),
  (5,  'Lima',      'Cusco',    '15:00', '21h', 99),
  (6,  'Lima',      'Cusco',    '22:30', '21h', 109),
  (7,  'Arequipa',  'Cusco',    '08:00', '10h', 75),
  (8,  'Arequipa',  'Cusco',    '14:00', '10h', 75),
  (9,  'Lima',      'Trujillo', '09:00',  '9h', 55),
  (10, 'Lima',      'Trujillo', '21:00',  '9h', 60),
  (11, 'Cusco',     'Puno',     '10:30',  '7h', 45),
  (12, 'Puno',      'Cusco',    '09:00',  '7h', 45);

-- ------------------------------------------------------------
-- EQUIPO (20 conductores y azafatas)
-- ------------------------------------------------------------
INSERT INTO equipo (id, nombre, rol, telefono, dni, anios) VALUES
  (1,  'Juan Pérez',       'conductor', '987654301', '45123456', 12),
  (2,  'Luis Gómez',       'conductor', '987654302', '45123457', 15),
  (3,  'Carlos Díaz',      'conductor', '987654303', '45123458', 9),
  (4,  'Miguel Rojas',     'conductor', '987654304', '45123459', 11),
  (5,  'José Contreras',   'conductor', '987654305', '45123460', 8),
  (6,  'Ricardo Paredes',  'conductor', '987654306', '45123461', 14),
  (7,  'Alberto Ríos',     'conductor', '987654307', '45123462', 7),
  (8,  'Fernando Vargas',  'conductor', '987654308', '45123463', 10),
  (9,  'Daniel Quispe',    'conductor', '987654309', '45123464', 6),
  (10, 'Manuel Ortiz',     'conductor', '987654310', '45123465', 13),
  (11, 'Ana Torres',       'azafata',   '987654311', '45123466', 8),
  (12, 'Rosa Flores',      'azafata',   '987654312', '45123467', 10),
  (13, 'María León',       'azafata',   '987654313', '45123468', 7),
  (14, 'Carla Mendoza',    'azafata',   '987654314', '45123469', 5),
  (15, 'Paola Vega',       'azafata',   '987654315', '45123470', 6),
  (16, 'Sofía Delgado',    'azafata',   '987654316', '45123471', 9),
  (17, 'Elena Navarro',    'azafata',   '987654317', '45123472', 4),
  (18, 'Patricia Salas',   'azafata',   '987654318', '45123473', 7),
  (19, 'Verónica Soto',    'azafata',   '987654319', '45123474', 6),
  (20, 'Jimena Castro',    'azafata',   '987654320', '45123475', 5);

-- ------------------------------------------------------------
-- VEHICULOS
-- ------------------------------------------------------------
INSERT INTO vehiculos (id, placa, tipo, estado, sede, viaje_id, conductor_id, azafata_id) VALUES
  (1, 'ABC-123', 'Bus 2 pisos', 'En ruta',        'Arequipa', 1,  1, 11),
  (2, 'DEF-456', 'Bus 2 pisos', 'En terminal',    'Lima',     4,  NULL, NULL),
  (3, 'GHI-789', 'Bus 1 piso',  'En ruta',        'Trujillo', 9,  2,  NULL),
  (4, 'JKL-012', 'Minibús',     'En mantenimiento','Lima',    NULL, NULL, NULL),
  (5, 'MNO-345', 'Bus 2 pisos', 'En terminal',    'Lima',     2,  NULL, NULL),
  (6, 'PQR-678', 'Bus 2 pisos', 'En terminal',    'Lima',     5,  NULL, NULL),
  (7, 'STU-901', 'Bus 1 piso',  'En ruta',        'Cusco',    7,  4,  15),
  (8, 'VWX-234', 'Minibús',     'En terminal',    'Cusco',    11, NULL, NULL),
  (9, 'YZA-567', 'Bus 1 piso',  'En terminal',    'Puno',     12, NULL, NULL);

-- ------------------------------------------------------------
-- RESERVAS de demostracion (fecha de hoy y proximos dias)
-- ------------------------------------------------------------
INSERT INTO reservas (id, usuario_id, viaje_id, fecha, pasajeros, total, metodo_pago, estado, plan_familiar, confirmado_por) VALUES
  (1, 4,  1, CURRENT_DATE, 2, 267.00, 'tarjeta',     'Confirmada', 0, 1),
  (2, 5,  1, CURRENT_DATE, 1, 133.50, 'efectivo',    'Pendiente de confirmación', 0, NULL),
  (3, 6,  4, CURRENT_DATE, 2, 297.00, 'tarjeta',     'Confirmada', 0, 1),
  (4, 7,  4, CURRENT_DATE, 1, 99.00,  'yape',        'Confirmada', 0, 1),
  (5, 8,  9, CURRENT_DATE, 1, 55.00,  'efectivo',    'Pendiente de confirmación', 0, NULL),
  (6, 9,  2, CURRENT_DATE + 2, 1, 133.50, 'transferencia', 'Confirmada', 0, 1),
  (7, 10, 7, CURRENT_DATE + 1, 2, 150.00, 'efectivo', 'Pendiente de confirmación', 0, NULL),
  (8, 11, 5, CURRENT_DATE + 3, 1, 99.00,  'tarjeta', 'Confirmada', 0, 1);

INSERT INTO reserva_asientos (reserva_id, asiento, piso) VALUES
  (1, 1, 1), (1, 2, 1),
  (2, 5, 1),
  (3, 10, 1), (3, 11, 1),
  (4, 21, 2),
  (5, 30, 2),
  (6, 3, 1),
  (7, 40, 2), (7, 41, 2),
  (8, 22, 2);

INSERT INTO pagos (reserva_id, metodo, monto, estado, confirmado_por) VALUES
  (1, 'tarjeta',     267.00, 'Confirmado', 1),
  (2, 'efectivo',    133.50, 'Pendiente',  NULL),
  (3, 'tarjeta',     297.00, 'Confirmado', 1),
  (4, 'yape',        99.00,  'Confirmado', 1),
  (5, 'efectivo',    55.00,  'Pendiente',  NULL),
  (6, 'transferencia',133.50,'Confirmado', 1),
  (7, 'efectivo',    150.00, 'Pendiente',  NULL),
  (8, 'tarjeta',     99.00,  'Confirmado', 1);

-- ------------------------------------------------------------
-- BITACORA de recorridos y traslados (ejemplos)
-- ------------------------------------------------------------
INSERT INTO bitacora (tipo, placa, conductor, origen, destino, estado, fecha, hora_salida) VALUES
  ('recorrido', 'ABC-123', 'Juan Pérez',    'Lima',     'Arequipa', 'En ruta',  CURRENT_DATE, '06:00'),
  ('recorrido', 'GHI-789', 'Luis Gómez',    'Lima',     'Trujillo', 'En ruta',  CURRENT_DATE, '09:00'),
  ('recorrido', 'STU-901', 'Miguel Rojas',  'Arequipa', 'Cusco',    'En ruta',  CURRENT_DATE, '08:00'),
  ('traslado',  'MNO-345', NULL,            'Lima',     'Arequipa', NULL,       CURRENT_DATE, NULL),
  ('traslado',  'VWX-234', NULL,            'Lima',     'Cusco',    NULL,       CURRENT_DATE, NULL),
  ('traslado',  'YZA-567', NULL,            'Lima',     'Puno',     NULL,       CURRENT_DATE, NULL);

-- ------------------------------------------------------------
-- LOGS DE AUDITORIA (ejemplos)
-- ------------------------------------------------------------
INSERT INTO logs_actividad (usuario_id, usuario_nombre, accion, modulo, detalle, resultado, ip) VALUES
  (1, 'Administrador Andesbus', 'Inició sesión', 'auth', NULL, 'Correcto', '127.0.0.1'),
  (2, 'Carlos Ramírez', 'Inició sesión', 'auth', NULL, 'Correcto', '127.0.0.1'),
  (1, 'Administrador Andesbus', 'Creó usuario', 'usuarios', 'Creó el usuario "Kiara Llanos"', 'Correcto', '127.0.0.1'),
  (2, 'Carlos Ramírez', 'Confirmó pago', 'pagos', 'Confirmó pago en efectivo de la reserva #2', 'Correcto', '127.0.0.1');

-- ------------------------------------------------------------
-- Sincronizar secuencias tras insertar IDs explícitos
-- ------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('permisos', 'id'), (SELECT MAX(id) FROM permisos));
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), (SELECT MAX(id) FROM usuarios));
SELECT setval(pg_get_serial_sequence('viajes', 'id'), (SELECT MAX(id) FROM viajes));
SELECT setval(pg_get_serial_sequence('equipo', 'id'), (SELECT MAX(id) FROM equipo));
SELECT setval(pg_get_serial_sequence('vehiculos', 'id'), (SELECT MAX(id) FROM vehiculos));
SELECT setval(pg_get_serial_sequence('reservas', 'id'), (SELECT MAX(id) FROM reservas));
