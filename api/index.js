/**
 * Función serverless de Vercel: reutiliza la misma app Express.
 * Todas las rutas (/api/* y el frontend estático) pasan por aquí.
 */
const app = require('../backend/app');

module.exports = app;
