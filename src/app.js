const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const { config } = require('./config/env');

const expedienteRoutes = require('./routes/expedienteRoutes');
const chatRoutes = require('./routes/chatRoutes');
const smsRoutes = require('./routes/smsRoutes');
const vozRoutes = require('./routes/vozRoutes');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  const requestId = req.get('X-Request-Id') || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = String(origin || '').replace(/\/$/, '');
      if (!origin || config.corsOrigins.includes('*') || config.corsOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
  })
);
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'DP Te Responde 24/7 API', version: '3.0.0' });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'API DP disponible',
    environment: config.nodeEnv,
    mockExpediente: config.useMockExpediente,
    twilioConfigured: Boolean(config.twilioAccountSid && config.twilioAuthToken && config.twilioPhoneNumber)
  });
});

app.use('/api/expedientes', expedienteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/voice', vozRoutes);

app.use((_req, res) => {
  res.status(404).json({ codigo_estado: 404, mensaje: 'Ruta no encontrada', data: null });
});

app.use((error, req, res, _next) => {
  if (error?.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ codigo_estado: 403, mensaje: error.message, data: null, request_id: req.requestId });
  }

  const status = Number(error?.statusCode || 500);
  console.error(`[ERROR][${req.requestId}]`, error?.message || error);
  return res.status(status).json({
    codigo_estado: status,
    mensaje: status >= 500 ? 'No fue posible completar la operación.' : error.message,
    data: null,
    request_id: req.requestId
  });
});

module.exports = app;
