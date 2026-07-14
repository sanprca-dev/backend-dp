const twilio = require('twilio');
const { config } = require('../config/env');

const validateTwilioWebhook = (req, res, next) => {
  if (!config.twilioValidateWebhooks) return next();

  if (!config.twilioAuthToken || !config.publicBaseUrl) {
    console.error('[TWILIO] Validación activada sin TWILIO_AUTH_TOKEN o PUBLIC_BASE_URL.');
    return res.status(500).send('Configuración de seguridad incompleta');
  }

  const signature = req.get('X-Twilio-Signature') || '';
  const url = `${config.publicBaseUrl}${req.originalUrl}`;
  const valid = twilio.validateRequest(config.twilioAuthToken, signature, url, req.body || {});

  if (!valid) {
    console.warn('[TWILIO] Webhook rechazado por firma inválida.');
    return res.status(403).send('Forbidden');
  }

  return next();
};

module.exports = { validateTwilioWebhook };
