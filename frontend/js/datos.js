const VIAJES = [
  { id: 1, origen: "Lima", destino: "Arequipa", hora: "06:00", duracion: "16h", precio: 89 },
  { id: 2, origen: "Lima", destino: "Arequipa", hora: "12:00", duracion: "16h", precio: 89 },
  { id: 3, origen: "Lima", destino: "Arequipa", hora: "20:00", duracion: "16h", precio: 99 },
  { id: 4, origen: "Lima", destino: "Cusco", hora: "07:30", duracion: "21h", precio: 99 },
  { id: 5, origen: "Lima", destino: "Cusco", hora: "15:00", duracion: "21h", precio: 99 },
  { id: 6, origen: "Lima", destino: "Cusco", hora: "22:30", duracion: "21h", precio: 109 },
  { id: 7, origen: "Arequipa", destino: "Cusco", hora: "08:00", duracion: "10h", precio: 75 },
  { id: 8, origen: "Arequipa", destino: "Cusco", hora: "14:00", duracion: "10h", precio: 75 },
  { id: 9, origen: "Lima", destino: "Trujillo", hora: "09:00", duracion: "9h", precio: 55 },
  { id: 10, origen: "Lima", destino: "Trujillo", hora: "21:00", duracion: "9h", precio: 60 },
  { id: 11, origen: "Cusco", destino: "Puno", hora: "10:30", duracion: "7h", precio: 45 },
  { id: 12, origen: "Puno", destino: "Cusco", hora: "09:00", duracion: "7h", precio: 45 }
];

const RESERVAS_KEY = "busEmpresa_reservas";

const PISO1_ASIENTOS = 20;
const PISO1_MULTIPLICADOR = 1.5;

function precioAsiento(viaje, numero) {
  return numero <= PISO1_ASIENTOS ? viaje.precio * PISO1_MULTIPLICADOR : viaje.precio;
}

function pisoDeAsiento(numero) {
  return numero <= PISO1_ASIENTOS ? 1 : 2;
}
