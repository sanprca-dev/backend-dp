require('dotenv').config();

const app = require('./src/app');
const { config } = require('./src/config/env');

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`[START] DP Te Responde API escuchando en puerto ${config.port}`);
});

const shutdown = (signal) => {
  console.log(`[STOP] Señal ${signal}. Cerrando servidor...`);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
