const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  apiDP: process.env.API_DP || '',
  apiTimeoutMs: Number(process.env.API_TIMEOUT_MS || 10000),
  useMockExpediente: parseBoolean(process.env.USE_MOCK_EXPEDIENTE, false),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS || 'http://localhost:5173'),
  publicBaseUrl: String(process.env.PUBLIC_BASE_URL || '').replace(/\/$/, ''),
  twilioValidateWebhooks: parseBoolean(process.env.TWILIO_VALIDATE_WEBHOOKS, false),
  twilioMockMode: parseBoolean(process.env.TWILIO_MOCK_MODE, false),
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  ollamaURL: process.env.OLLAMA_URL || '',
  ollamaModel: process.env.OLLAMA_MODEL || ''
};

module.exports = { config };
